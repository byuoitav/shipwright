terraform {
  backend "s3" {
    bucket     = "terraform-state-storage-586877430255"
    lock_table = "terraform-state-lock-586877430255"
    region     = "us-west-2"

    // THIS MUST BE UNIQUE
    key = "shipwright.tfstate"
  }
}

provider "aws" {
  region = "us-west-2"
}

data "aws_ssm_parameter" "eks_cluster_endpoint" {
  name = "/eks/av-cluster-endpoint"
}

provider "kubernetes" {
  host = data.aws_ssm_parameter.eks_cluster_endpoint.value
}

// import information from byu acs
module "acs" {
  source            = "github.com/byuoitav/terraform//modules/acs-info"
  env               = "prd"
  department_name   = "av"
  vpc_vpn_to_campus = true
}

// Redis

resource "aws_security_group" "shipwright_redis" {
  name        = "shipwright-redis"
  description = "allows traffic from shipwright"
  vpc_id      = module.acs.vpc.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.acs.vpc.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    env  = "stg"
    team = "OIT-AV"
  }
}


resource "aws_elasticache_cluster" "shipwright-stg" {
  cluster_id           = "shipwright-stg"
  engine               = "redis"
  node_type            = "cache.r5.large"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis5.0"
  engine_version       = "5.0.6"
  port                 = 6379
  subnet_group_name    = "vpn-av-oregon-prd-elasticache-subnet-group"
  security_group_ids   = [aws_security_group.shipwright_redis.id]
}

// pull all env vars out of ssm

data "aws_ssm_parameter" "auth_url" {
  name = "/env/shipwright/opa-url"
}

data "aws_ssm_parameter" "uapi_auth_token" {
  name = "/env/shipwright/opa-token"
}

data "aws_ssm_parameter" "oauth_callback_url" {
  name = "/env/shipwright/oauth-callback-url"
}

data "aws_ssm_parameter" "client_id" {
  name = "/env/shipwright/client-id"
}

data "aws_ssm_parameter" "client_secret" {
  name = "/env/shipwright/client-secret"
}

data "aws_ssm_parameter" "elk_address" {
  name = "/env/shipwright/elk-address"
}

data "aws_ssm_parameter" "elk_password" {
  name = "/env/shipwright/elk-password"
}

data "aws_ssm_parameter" "elk_username" {
  name = "/env/shipwright/elk-username"
}

data "aws_ssm_parameter" "gateway_url" {
  name = "/env/shipwright/gateway-url"
}

data "aws_ssm_parameter" "event_hub_address" {
  name = "/env/shipwright/event-hub-address"
}

data "aws_ssm_parameter" "jwt_signing_token" {
  name = "/env/shipwright/jwt-signing-token"
}

data "aws_ssm_parameter" "ldap_password" {
  name = "/env/shipwright/ldap-password"
}

data "aws_ssm_parameter" "ldap_search_scope" {
  name = "/env/shipwright/ldap-search-scope"
}

data "aws_ssm_parameter" "ldap_url" {
  name = "/env/shipwright/ldap-url"
}

data "aws_ssm_parameter" "ldap_username" {
  name = "/env/shipwright/ldap-username"
}

data "aws_ssm_parameter" "responder_group" {
  name = "/env/shipwright/responder-group"
}

data "aws_ssm_parameter" "servicenow_token" {
  name = "/env/shipwright/servicenow-token"
}

data "aws_ssm_parameter" "stg_db_address" {
  name = "/env/dev-couch-address"
}

data "aws_ssm_parameter" "stg_db_password" {
  name = "/env/dev-couch-password"
}

data "aws_ssm_parameter" "stg_db_username" {
  name = "/env/dev-couch-username"
}

module "shipwright_stg" {
  source = "github.com/byuoitav/terraform//modules/kubernetes-deployment"

  // required
  name           = "shipwright-stg"
  image          = "byuoitav/shipwright"
  image_version  = "never-EAC"
  container_port = 80
  repo_url       = "https://github.com/byuoitav/shipwright"

  // optional
  public_urls = ["smee-stg.av.byu.edu"]
  container_env = {
    CALLBACK_URL          = data.aws_ssm_parameter.oauth_callback_url.value
    CLIENT_ID             = data.aws_ssm_parameter.client_id.value
    CLIENT_SECRET         = data.aws_ssm_parameter.client_secret.value
    COOKIE_DOMAIN         = ".byu.edu"
    COUCH_ADDRESS         = data.aws_ssm_parameter.stg_db_address.value
    COUCH_PASSWORD        = data.aws_ssm_parameter.stg_db_password.value
    COUCH_USERNAME        = data.aws_ssm_parameter.stg_db_username.value
    DB_ADDRESS            = data.aws_ssm_parameter.stg_db_address.value
    DB_PASSWORD           = data.aws_ssm_parameter.stg_db_password.value
    DB_USERNAME           = data.aws_ssm_parameter.stg_db_username.value
    ELK_DIRECT_ADDRESS    = data.aws_ssm_parameter.elk_address.value
    ELK_SA_PASSWORD       = data.aws_ssm_parameter.elk_password.value
    ELK_SA_USERNAME       = data.aws_ssm_parameter.elk_username.value
    GATEWAY_URL           = data.aws_ssm_parameter.gateway_url.value
    HUB_ADDRESS           = data.aws_ssm_parameter.event_hub_address.value
    JWT_SIGNING_TOKEN     = data.aws_ssm_parameter.jwt_signing_token.value
    LDAP_PASSWORD         = data.aws_ssm_parameter.ldap_password.value
    LDAP_SEARCH_SCOPE     = data.aws_ssm_parameter.ldap_search_scope.value
    LDAP_URL              = data.aws_ssm_parameter.ldap_url.value
    LDAP_USERNAME         = data.aws_ssm_parameter.ldap_username.value
    LOG_LEVEL             = "info"
    RESPONDER_GROUP       = data.aws_ssm_parameter.responder_group.value
    SERVICENOW_WSO2_TOKEN = data.aws_ssm_parameter.servicenow_token.value
    STOP_REPLICATION      = "true"
    SYSTEM_ID             = "shipwright-stg"
  }
  container_args = [
    "--opa-url", data.aws_ssm_parameter.auth_url.value,
    "--opa-token", data.aws_ssm_parameter.uapi_auth_token.value,
  ]
}

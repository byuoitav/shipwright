import {
  JsonObject,
  JsonProperty,
} from "json2typescript";


@JsonObject("User")
export class User {
  @JsonProperty("user_name", String, true)
  userName: string = "";

  @JsonProperty("email", String, true)
  email: string = "";
  
  @JsonProperty("home_phone", String, true)
  homePhone: string = "";

  @JsonProperty("name", String, true)
  name: string = "";

  @JsonProperty("employee_number", String, true)
  employeeNumber: string = "";
  
  @JsonProperty("title", String, true)
  title: string = "";
}

@JsonObject("ExternalLink")
export class ExternalLink {
  @JsonProperty("display_value", String, true)
  value: string = "";
}

@JsonObject("DetailedUser")
export class DetailedUser {
  @JsonProperty("user_name", ExternalLink, true)
  userName: ExternalLink = {value: ""};

  @JsonProperty("email", ExternalLink, true)
  email: ExternalLink = {value: ""};

  @JsonProperty("home_phone", ExternalLink, true)
  homePhone: ExternalLink = {value: ""};

  @JsonProperty("name", ExternalLink, true)
  name: ExternalLink = {value: ""};

  @JsonProperty("employee_number", ExternalLink, true)
  employeeNumber: ExternalLink = {value: ""};

  @JsonProperty("u_primary_role", ExternalLink, true)
  primaryRole: ExternalLink = {value: ""};

  @JsonProperty("gender", ExternalLink, true)
  gender: ExternalLink = {value: ""};

  @JsonProperty("u_slack_username", ExternalLink, true)
  slackUsername: ExternalLink = {value: ""};

  @JsonProperty("title", ExternalLink, true)
  title: ExternalLink = {value: ""};

  @JsonProperty("mobile_phone", ExternalLink, true)
  mobilePhone: ExternalLink = {value: ""};

  @JsonProperty("u_primary_group", ExternalLink, true)
  primaryGroup: ExternalLink = {value: ""};

  @JsonProperty("department", ExternalLink, true)
  department: ExternalLink = {value: ""};

  @JsonProperty("manager", ExternalLink, true)
  manager: ExternalLink = {value: ""};
}

@JsonObject("DetailedUserWrapper")
export class DetailedUserWrapper {
  @JsonProperty("result", [DetailedUser], true)
  user: DetailedUser[] = [];
}



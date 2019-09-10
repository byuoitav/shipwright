import {
  JsonObject,
  JsonProperty,
} from "json2typescript";


@JsonObject("User")
export class User {
  @JsonProperty("user_name", String, true)
  userName: string = undefined;

  @JsonProperty("email", String, true)
  email: string = undefined;
  
  @JsonProperty("home_phone", String, true)
  homePhone: string = undefined;

  @JsonProperty("name", String, true)
  name: string = undefined;

  @JsonProperty("employee_number", String, true)
  employeeNumber: string = undefined;
}
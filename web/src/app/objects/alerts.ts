import {
  JsonObject,
  JsonProperty,
  JsonConverter,
  JsonCustomConvert,
  Any,
} from "json2typescript";
import { Person } from "src/app/objects/database";
import { DateConverter } from "./date";

@JsonObject("ResolutionInfo")
export class ResolutionInfo {
  @JsonProperty("resolution-code", String, true)
  code: string = undefined;

  @JsonProperty("notes", String, true)
  notes: string = undefined;

  @JsonProperty("resolved-at", DateConverter, true)
  resolvedAt: Date = undefined;
}

@JsonObject("Alert")
export class Alert {
  @JsonProperty("id", String, true)
  alertID: string = undefined;

  @JsonProperty("buildingID", String, true)
  buildingID: string = undefined;

  @JsonProperty("roomID", String, true)
  roomID: string = undefined;

  @JsonProperty("deviceID", String, true)
  deviceID: string = undefined;

  @JsonProperty("type", String, true)
  type: string = undefined;

  @JsonProperty("category", String, true)
  category: string = undefined;

  @JsonProperty("severity", String, true)
  severity: string = undefined;

  @JsonProperty("message", String, true)
  message: string = undefined;

  @JsonProperty("message-log", [String], true)
  messageLog: string[] = Array<string>();

  @JsonProperty("data", Any, true)
  data: any = undefined;

  @JsonProperty("system-type", String, true)
  systemType: string = undefined;

  @JsonProperty("start-time", DateConverter, true)
  startTime: Date = undefined;

  @JsonProperty("end-time", DateConverter, true)
  endTime: Date = undefined;

  @JsonProperty("update-time", DateConverter, true)
  updateTime: Date = undefined;

  @JsonProperty("active", Boolean, true)
  active: boolean = undefined;

  @JsonProperty("alert-tags", [String], true)
  alertTags: string[] = Array<string>();

  @JsonProperty("device-tags", [String], true)
  deviceTags: string[] = Array<string>();

  @JsonProperty("requester", String, true)
  requester: string = undefined;

  @JsonProperty("manual-resolve", Boolean, true)
  manualResolve: boolean = undefined;
}

@JsonObject("RoomIssueResponse")
export class RoomIssueResponse {
  @JsonProperty("responders", [Person], true)
  responders: Person[] = Array<Person>();

  @JsonProperty("help-sent-at", DateConverter, true)
  helpSentAt: Date = undefined;

  @JsonProperty("help-arrived-at", DateConverter, true)
  helpArrivedAt: Date = undefined;

  SentIsZero(): boolean {
    if (this.helpSentAt === undefined) {
      return true;
    }

    const zero = "0001-01-01T00:00:00.000Z";

    return this.helpSentAt.toISOString() === zero;
  }

  ArrivedIsZero(): boolean {
    if (this.helpArrivedAt === undefined) {
      return true;
    }
    const zero = "0001-01-01T00:00:00.000Z";

    return this.helpArrivedAt.toISOString() === zero;
  }
}

@JsonObject("RoomIssue")
export class RoomIssue {
  @JsonProperty("id", String, true)
  issueID: string = undefined;

  @JsonProperty("buildingID", String, true)
  buildingID: string = undefined;

  @JsonProperty("roomID", String, true)
  roomID: string = undefined;

  @JsonProperty("alert-severities", [String], true)
  alertSeverities: string[] = undefined;

  @JsonProperty("room-tags", [String], true)
  roomTags: string[] = Array<string>();

  @JsonProperty("issue-tags", [String], true)
  issueTags: string[] = Array<string>();

  @JsonProperty("alert-types", [String], true)
  alertTypes: string[] = Array<string>();

  @JsonProperty("alert-devices", [String], true)
  alertDevices: string[] = Array<string>();

  @JsonProperty("alert-categories", [String], true)
  alertCategories: string[] = Array<string>();

  @JsonProperty("alert-count", Number, true)
  alertCount: number = undefined;

  @JsonProperty("active-alert-types", [String], true)
  activeAlertTypes: string[] = Array<string>();

  @JsonProperty("active-alert-categories", [String], true)
  activeAlertCategories: string[] = Array<string>();

  @JsonProperty("active-alert-devices", [String], true)
  activeAlertDevices: string[] = Array<string>();

  @JsonProperty("active-alert-severities", [String], true)
  activeAlertSeverities: string[] = Array<string>();

  @JsonProperty("active-alert-count", Number, true)
  activeAlertCount: number = undefined;

  @JsonProperty("incident-id", [String], true)
  incidentID: string[] = Array<string>();

  @JsonProperty("system-type", String)
  systemType: string = undefined;

  @JsonProperty("notes", String, true)
  notes: string = undefined;

  @JsonProperty("notes-log", [String], true)
  notesLog: string[] = Array<string>();

  @JsonProperty("responses", [RoomIssueResponse], true)
  roomIssueResponses: RoomIssueResponse[] = Array<RoomIssueResponse>();

  @JsonProperty("resolved", Boolean, true)
  resolved: boolean = undefined;

  @JsonProperty("resolution-info", ResolutionInfo, true)
  resolutionInfo: ResolutionInfo = undefined;

  @JsonProperty("alerts", [Alert], true)
  alerts: Alert[] = Array<Alert>();

  ResolvedAtIsZero(): boolean {
    if (this.resolutionInfo.resolvedAt === undefined) {
      return true;
    }
    const zero = "0001-01-01T00:00:00.000Z";

    return this.resolutionInfo.resolvedAt.toISOString() === zero;
  }
}

@JsonObject("ClassSchedule")
export class ClassSchedule {
  @JsonProperty("dept_name", String, true)
  deptName: string = undefined;

  @JsonProperty("catalog_number", String, true)
  ctgName: string = undefined;

  @JsonProperty("catalog_suffix", Any, true)
  ctgSuffix: any = undefined;

  @JsonProperty("lab_quiz_section", Any, true)
  labQuizSection: any = undefined;

  @JsonProperty("honors", Any, true)
  honors: any = undefined;

  @JsonProperty("serv_learning", Any, true)
  servLearning: any = undefined;

  @JsonProperty("credit_hours", Number, true)
  creditHours: number = 0;

  @JsonProperty("section_type", Any, true)
  sectionType: any = undefined;

  @JsonProperty("class_time", String, true)
  classTime: string = undefined;

  @JsonProperty("days", String, true)
  days: string = undefined;

  @JsonProperty("instructor_name", String, true)
  instrName: string = undefined;

  @JsonProperty("section_size", Number, true)
  secSize: number = 0;

  @JsonProperty("total_enr", Number, true)
  totalEnr: number = 0;

  @JsonProperty("sched_type", String, true)
  schedType: string = undefined;

  @JsonProperty("assign_to", Any, true)
  assignTo: any = undefined;

  @JsonProperty("start_date", Any, true)
  startDate: any = undefined;

  @JsonProperty("end_date", Any, true)
  endDate: any = undefined;

  @JsonProperty("start_time", DateConverter, true)
  startTime: Date = undefined;

  @JsonProperty("end_time", DateConverter, true)
  endTime: Date = undefined;
}

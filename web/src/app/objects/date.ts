import { JsonConverter, JsonCustomConvert } from "json2typescript";

@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    if (!date) {
      return undefined;
    }

    function pad(n) {
      return n < 10 ? "0" + n : n;
    }

    return (
      date.getUTCFullYear() +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      ":" +
      pad(date.getUTCMinutes()) +
      ":" +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }

  deserialize(date: any): Date {
    if (!date || date === "0001-01-01T00:00:00Z") {
      return undefined;
    }

    return new Date(date);
  }
}

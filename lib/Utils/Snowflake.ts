const HIVEN_EPOCH = 1562544e6;

export function SnowflakeToDate(snowflake: string): Date {
  const time = parseInt(snowflake, 10) / 4194304 + HIVEN_EPOCH;
  const timestamp = !Number.isNaN(time) ? time : '';

  return new Date(timestamp);
}

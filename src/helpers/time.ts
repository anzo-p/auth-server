export function unixEpochNow() {
  return Math.floor(Date.now() / 1000);
}

export function unixEpochToVerbal(instant: number): string {
  const date = new Date(instant * 1000);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  };

  const dateFormatter = new Intl.DateTimeFormat('fi-EN', options);
  return dateFormatter.format(date);
}

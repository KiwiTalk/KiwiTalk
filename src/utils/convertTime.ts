export function convertTime(time: Date, use24format = true) {
  const hour = time.getHours();
  const minute = time.getMinutes();

  const hourStr =
    use24format ?
      hour.toString() :
      hour < 12 ?
        `오전 ${hour === 0 ? 12 : hour}` :
        `오후 ${hour === 12 ? hour : hour - 12}`;

  return `${hourStr}:${minute < 10 ? `0${minute}` : minute}`;
}

export default convertTime;

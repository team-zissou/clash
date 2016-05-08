export function humanTime(then, now = Date.now()) {
  const minute = 1000*60
  let dt = now - then
  let minutes = dt/minute

  if (minutes < 1) {
    return "less than a minute ago"
  }

  return `${minutes|0} minutes ago`
}

export function extractFirstJson(str: string): string | null {
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return str.substring(firstBrace, lastBrace + 1);
  }
  return null;
}

// Removes the first JSON object (and optional ```json/``` wrappers) from a string and returns the rest
export function removeFirstJson(str: string): string {
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    let before = str.substring(0, firstBrace);
    let after = str.substring(lastBrace + 1);
    let result = (before + after).replace(/```json|```/g, '').trim();
    return result;
  }
  return str;
}

// For CommonJS compatibility (sometimes needed in React Native/Metro):
module.exports = { extractFirstJson, removeFirstJson };
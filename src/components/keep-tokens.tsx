const tokenPattern =
  /(\d{4}年\d{1,2}月(?:\d{1,2}日)?|\d{4}년 \d{1,2}월(?: \d{1,2}일)?|(?:January|February|March|April|May|June|July|August|September|October|November|December)(?: \d{1,2},)? \d{4}|YJ-[A-Z0-9-]+|新臺幣\s[\d,]+\s元|新台币\s[\d,]+\s元|TWD\s[\d,]+|[\d,]+台湾ドル|[\d,]+대만 달러)/g

export function KeepTokens({ text }: { text: string }) {
  const nodes: React.ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    nodes.push(
      <span key={index} className="nowrap">
        {match[0]}
      </span>,
    )
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}

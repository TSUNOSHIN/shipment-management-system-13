export async function lookupAddressByZipcode(zipcode: string): Promise<string> {
  const res = await fetch(
    `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`,
  )

  if (!res.ok) {
    throw new Error('住所検索に失敗しました。')
  }

  const data = await res.json()

  if (data.status !== 200 || !data.results || data.results.length === 0) {
    throw new Error('該当する住所が見つかりませんでした。')
  }

  const result = data.results[0]
  return `${result.address1}${result.address2}${result.address3}`
}

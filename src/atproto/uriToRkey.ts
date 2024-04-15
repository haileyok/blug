export const uriToRkey = (uri: string): string => {
  const rkey = uri.split('/').pop()
  if (!rkey) {
    throw new Error('Failed to get rkey from uri.')
  } else {
    return rkey
  }
}

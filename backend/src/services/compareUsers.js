export function findNonFollowers(followers, following) {
  const followersSet = new Set(followers);
  const nonFollowers = [];

  for (const username of following) {
    if (!followersSet.has(username)) {
      nonFollowers.push(username);
    }
  }

  return [...new Set(nonFollowers)];
}

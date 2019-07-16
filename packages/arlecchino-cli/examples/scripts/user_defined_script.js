module.exports = async function ({ assignToStore, currentPage }) {
  assignToStore(["url"], currentPage.url());
  return;
};

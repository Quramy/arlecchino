module.exports = async function (context) {
  context.assignToStore(["url"], context.currentPage.url());
  return;
};

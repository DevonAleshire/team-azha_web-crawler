const parsingService = require('../pageparse.js');

/*********************
//Depth-First Search
**********************/

test('searchHelper calls crawlDepthFirstHelper for dfs', () => {
  //Arrange
  const args = ['url', 'dfs', '0', 'key'];

  //Mock Helpers
  crawlDepthFirstHelperMock = jest.spyOn(parsingService, 'crawlDepthFirstHelper');

  //Act
  parsingService.searchHelper(...args);

  //Assert
  expect(crawlDepthFirstHelperMock).toHaveBeenCalledTimes(1);
  expect(crawlDepthFirstHelperMock).toHaveBeenCalledWith('url', '0', 'key');
});

test('crawlDepthFirstHelper calls crawlDepthFirst', () => {
  //Arrange
  const args = ['url', '10', 'key'];

  //Mock Helpers
  crawlDepthFirstMock = jest.spyOn(parsingService, 'crawlDepthFirst');

  //Act
  parsingService.crawlDepthFirstHelper(...args);

  //Assert
  expect(crawlDepthFirstMock).toHaveBeenCalledTimes(1)
  expect(crawlDepthFirstMock).toHaveBeenCalledWith('url', '10', 0, 'key')
});

//TODO: Implement Unit Test for crawlDepthFirst()


/*********************
  Breadth-First Search
**********************/
test('searchHelper calls crawlBreadthFirstHelper for bfs', () => {
  //Arrange
  const args = ['url', 'bfs', '0', 'key'];

  //Mock Helpers
  crawlBreadthFirstHelperMock = jest.spyOn(parsingService, 'crawlBreadthFirstHelper');

  //Act
  parsingService.searchHelper(...args);

  //Assert
  expect(crawlBreadthFirstHelperMock).toHaveBeenCalledTimes(1);
  expect(crawlDepthFirstHelperMock).toHaveBeenCalledWith('url', '0', 'key');
});

test('crawlBreadthFirstHelper calls crawlBreadthFirst', () => {
  //Arrange
  const args = ['url', '10', 'key'];

  //Mock Helpers
  crawlBreadthFirstMock = jest.spyOn(parsingService, 'crawlBreadthFirst');

  //Act
  parsingService.crawlBreadthFirstHelper(...args);

  //Assert
  expect(crawlBreadthFirstMock).toHaveBeenCalledTimes(1);
  expect(crawlBreadthFirstMock).toHaveBeenCalledWith('url', '10', 0, 'key');
});
var mockery = require('mockery')
var chai = require('chai')
var expect = chai.expect

var queue = []
var mockValue = ''

var mockThrough = function (write, end) {
  write(mockValue)
  end.bind(mockThrough)()
}
mockThrough.queue = function (value) {
  queue.push(value)
}

describe('markdownify', function () {
  before(function () {
    mockery.enable()
    mockery.registerMock('through', mockThrough)
    markdownify = require('./markdownify')
  })

  after(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  beforeEach(function () {
    queue = []
  })

  it('parses markdown with front matter', function () {
    mockValue = '---\nfoo: bar\n---\n\nHey!'
    markdownify('foo.md')
    expect(queue[0]).to.eq('module.exports = {"orig":"---\\nfoo: bar\\n---\\n\\nHey!","data":{"foo":"bar"},"content":"<p>Hey!</p>\\n"};')
  })
  it('parses markdown without front matter', function () {
    mockValue = 'Hey!'
    markdownify('bar.md')
    expect(queue[0]).to.eq('module.exports = {"orig":"Hey!","data":{},"content":"<p>Hey!</p>\\n"};')
  })
})

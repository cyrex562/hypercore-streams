const tape = require('tape')
const { WriteStream, ReadStream } = require('./')
const ram = require('random-access-memory')
const hypercore = require('hypercore')

tape('basic readstream', function (t) {
  const feed = hypercore(ram)

  feed.append(['a', 'b', 'c'], function () {
    const rs = new ReadStream(feed)
    const expected = ['a', 'b', 'c']

    rs.on('data', function (data) {
      t.same(data, Buffer.from(expected.shift()))
    })
    rs.on('end', function () {
      t.end()
    })
  })
})

tape('live readstream', function (t) {
  t.plan(2)

  const feed = hypercore(ram)

  feed.append(['a', 'b', 'c'], function () {
    const rs = new ReadStream(feed, { start: 1, live: true })
    const expected = ['b', 'c']

    rs.on('data', function (data) {
      t.same(data, Buffer.from(expected.shift()))
    })
    rs.on('end', function () {
      t.fail('should not end')
    })
  })
})

tape('basic writestream', function (t) {
  t.plan(1 + 2 * 3)

  const feed = hypercore(ram)

  const ws = new WriteStream(feed)

  ws.write(Buffer.from('a'))
  ws.write(Buffer.from('b'))
  ws.write(Buffer.from('c'))

  ws.end()

  ws.on('finish', function () {
    t.same(feed.length, 3)

    feed.get(0, function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, Buffer.from('a'))
    })

    feed.get(1, function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, Buffer.from('b'))
    })

    feed.get(2, function (err, buf) {
      t.error(err, 'no error')
      t.same(buf, Buffer.from('c'))
    })
  })
})
import { databaseConnectionDetails, getSingleEventById } from './helpers'

import { EventStore } from '@silly-goose-software/event-sauced-ts'
import { PostgreSQLStorageEngine } from '../src/PostgreSQLStorageEngine'
import { v4 as newGuid } from 'uuid'

describe('Given a configured PostgreSQLStorageEngine', () => {
  let engine: PostgreSQLStorageEngine
  let store: EventStore
  let getEventByEventId: (query: string) => Promise<any>

  beforeAll(async () => {
    engine = new PostgreSQLStorageEngine(databaseConnectionDetails)
    getEventByEventId = getSingleEventById(databaseConnectionDetails)

    await engine.initialise()
    store = new EventStore(engine)
  })
  describe('When reading an empty stream', () => {
    const streamIdForEmptyStream = newGuid()
    it.todo('It should return an empty array of events')
  })
  describe('When reading a stream with multiple events', () => {
    it.todo('It should return the entire event stream')
    it.todo('It should return a subset of events')
  })

  afterAll(async () => {
    if (engine) await engine.terminate()
  })
})

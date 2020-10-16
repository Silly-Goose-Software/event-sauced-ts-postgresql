import { EventData, EventStore } from '@silly-goose-software/event-sauced-ts'
import { OrderCreated, OrderDispatched } from './Events/'
import { databaseConnectionDetails, getSingleEventById } from './helpers'

import { PostgreSQLStorageEngine } from '../src/PostgreSQLStorageEngine'
import { v4 as newGuid } from 'uuid'

describe('Given a initialised PostgreSQLStorageEngine', () => {
  let engine: PostgreSQLStorageEngine
  let store: EventStore
  let getEventWithQuery: (eventId: string) => Promise<any>

  beforeAll(async () => {
    engine = new PostgreSQLStorageEngine(databaseConnectionDetails)
    getEventWithQuery = (eventId: string) =>
      getSingleEventById(databaseConnectionDetails)(
        `SELECT * FROM eventstore.commits where event_id='${eventId}' LIMIT 1;`
      )

    await engine.initialise()
    store = new EventStore(engine)
  })
  describe('When appending to a new stream', () => {
    it('It should save the event', async () => {
      const streamId = newGuid()
      const eventBody = new OrderCreated(streamId)
      const event = new EventData(newGuid(), eventBody)

      await store.appendToStream(streamId, 0, event)

      const savedEvent = await getEventWithQuery(event.eventId)
      expect(savedEvent.stream_id).toBeDefined()
      expect(savedEvent.stream_id).toBe(streamId)
      expect(savedEvent.event_id).toBeDefined()
      expect(savedEvent.event_id).toBe(event.eventId)
      expect(savedEvent.event_body).toEqual(eventBody)
    })
    it('It should save the metadata for the event', async () => {
      const streamId = newGuid()
      const eventBody = new OrderCreated(streamId)
      const metaData = { value_one: 1, value_2: 2, some_nested_property: { stuff: 'lol' } }
      const event = new EventData(newGuid(), eventBody, metaData)

      await store.appendToStream(streamId, 0, event)

      const savedEvent = await getEventWithQuery(event.eventId)

      expect(savedEvent.meta_data).toBeDefined()
      expect(savedEvent.meta_data).toEqual(metaData)
    })
    describe('And we have multiple events to save', () => {
      it('It should save both events', async (done) => {
        const streamId = newGuid()

        const firstEvent = new EventData(newGuid(), new OrderCreated(streamId))
        const secondEvent = new EventData(newGuid(), new OrderDispatched(streamId))

        await store.appendToStream(streamId, 0, firstEvent, secondEvent)

        const firstSavedEvent = await getEventWithQuery(firstEvent.eventId)
        const secondSavedEvent = await getEventWithQuery(secondEvent.eventId)

        expect(firstSavedEvent).toBeDefined()
        expect(secondSavedEvent).toBeDefined()

        expect(firstSavedEvent.event_body).toEqual(firstEvent.body)
        expect(secondSavedEvent.event_body).toEqual(secondEvent.body)
        done()
      })
      it.todo('It should save the events in the right order')
    })
    describe('And we try to persist the new event with an unexpected version', () => {
      it.todo('It should throw a concurrency error with revision number: blah')
    })
  })

  describe('When appending to an existing stream', () => {
    it.todo('It should save the new event')
    describe('And we try to persist the new event with an unexpected version', () => {
      it.todo('It should throw a concurrency error with revision number: blah')
    })
  })

  afterAll(async () => {
    if (engine) await engine.terminate()
  })
})

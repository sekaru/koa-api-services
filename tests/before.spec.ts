import chai from 'chai'
import { Request, Response, Service } from '../lib'
import { Before } from '../lib'
import buildMockRequest from './utils/buildMockRequest'

const expect = chai.expect

describe('@Before decorator', () => {
  it('should correctly pass in the request', async () => {
    let reqUserId: string

    class UserService implements Service {
      @Before(async (req: Request): Promise<void> => {
        reqUserId = req.query.userId
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200
        }
      }
    }

    await new UserService().get(buildMockRequest({
      query: {
        userId: '1'
      }
    }))

    expect(reqUserId).to.equal('1')
  })

  it('should correctly pass the caller context', async () => {
    let reqUserId: string

    class UserService implements Service {
      @Before(async (req: Request, caller: UserService): Promise<void> => {
        caller.handleBefore(req)
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200
        }
      }

      handleBefore(req: Request): void {
        reqUserId = req.query.userId
      }
    }

    await new UserService().get(buildMockRequest({
      query: {
        userId: '1'
      }
    }))

    expect(reqUserId).to.equal('1')
  })

  it('should deep freeze the request object', async () => {
    class UserService implements Service {
      @Before(async (req: Request, caller: UserService): Promise<void> => {
        req.query.userId = '2'
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200
        }
      }
    }

    let error: string = ''

    try {
      await new UserService().get(buildMockRequest({
        query: {
          userId: 1
        }
      }))
    } catch (err) {
      error = err.message
    }

    expect(error).to.equal('Cannot assign to read only property \'userId\' of object \'#<Object>\'')
  })

  it('should not freeze the request context object', async () => {
    class UserService implements Service {
      @Before(async (req: Request): Promise<void> => {
        req.ctx.state.user = {
          id: Number(req.query.userId)
        }
      })
      async get(req: Request): Promise<Response> {
        return {
          status: 200,
          body: {
            user: req.ctx.state.user
          }
        }
      }
    }

    const res = await new UserService().get(buildMockRequest({
      query: {
        userId: '1'
      }
    }))

    expect(res.body).to.eql({
      user: {
        id: 1
      }
    })  
  })
})
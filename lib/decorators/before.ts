import { Request, Response, BeforeCallback } from '../declarations'
import deepFreeze from '../utils/deepFreeze'

 export const Before = (func: BeforeCallback) => (tar: Object, _: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
   const original = descriptor.value

   descriptor.value = async function (req: Request): Promise<Response> {
      await func(deepFreeze(req, ['ctx']), this)

      const res: Response = await original.apply(this, [req])
      return res
   }

   return descriptor
 }

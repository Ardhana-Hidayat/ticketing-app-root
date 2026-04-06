import * as z from 'zod'; const schema = z.object({ price: z.coerce.number() }); type Input = z.input<typeof schema>; const i: Input = { price: 5 };

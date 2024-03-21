import { TRPCError } from '@trpc/server'
import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { GithubInfo } from '@penx/model'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const userRouter = createTRPCRouter({
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      })

      if (!user) new TRPCError({ code: 'NOT_FOUND' })

      return user!
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.token.uid },
    })

    if (!user) new TRPCError({ code: 'NOT_FOUND' })

    return user!
  }),

  byAddress: protectedProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { address: input.address },
      })

      return user
    }),

  getMySecret: protectedProcedure.query(async ({ ctx, input }) => {
    const { secret } = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.token.uid },
      select: { secret: true },
    })

    if (secret) return secret
    const user = await ctx.prisma.user.update({
      where: { id: ctx.token.uid },
      data: { secret: nanoid() },
    })
    return user.secret!
  }),

  search: protectedProcedure
    .input(z.object({ q: z.string() }))
    .query(async ({ ctx, input }) => {
      let { q } = input
      if (!q) return []
      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            {
              email: { contains: q, mode: 'insensitive' },
            },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      })

      return users
    }),

  selfHostedSignIn: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [username, password] = (
        process.env.SELF_HOSTED_CREDENTIALS as string
      ).split('/')

      if (username === input.username && password === input.password) {
        let user = await ctx.prisma.user.findFirst({
          where: { username, password },
        })

        if (!user) {
          user = await ctx.prisma.user.create({ data: { username, password } })
        }
        return user
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Snapshot not found',
        })
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { address } = input
      let user = await ctx.prisma.user.findFirst({ where: { address } })
      if (!user) {
        user = await ctx.prisma.user.create({ data: { address } })
      }
      return user
    }),

  updateAddress: protectedProcedure
    .input(z.object({ address: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { address } = input
      return ctx.prisma.user.update({
        where: { id: ctx.token.uid },
        data: { address },
      })
    }),

  updatePublicKey: protectedProcedure
    .input(
      z.object({
        publicKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { publicKey } = input
      return ctx.prisma.user.update({
        where: { id: ctx.token.uid },
        data: { publicKey },
        select: { publicKey: true, secret: true },
      })
    }),

  loginByPersonalToken: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const token = await ctx.prisma.personalToken.findUnique({
        where: { value: input },
      })
      if (!token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid personal token',
        })
      }

      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: token.userId },
        select: {
          id: true,
          address: true,
          earlyAccessCode: true,
          publicKey: true,
          secret: true,
          roleType: true,
          name: true,
          avatar: true,
          image: true,
        },
      })

      return {
        token: jwt.sign({ sub: user.id }, process.env.NEXTAUTH_SECRET!, {
          expiresIn: '365d',
        }),
        user,
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        address: z.string(),
        displayName: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        avatarURL: z.string().min(1).optional(),
        color: z.string().min(1).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.user.update({ where: { id }, data })
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.user.delete({ where: { id: input } })
  }),

  connectRepo: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        repo: z.string(),
        installationId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input
      const user = await ctx.prisma.user.findFirstOrThrow({
        where: { id: userId },
      })

      const github = (user.github || {}) as GithubInfo

      github.installationId = input.installationId
      github.repo = input.repo

      return ctx.prisma.user.update({
        where: { id: userId },
        data: { github },
      })
    }),

  disconnectTaskGithub: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.user.update({
      where: { id: ctx.token.uid },
      data: { taskGithub: {} },
    })
  }),

  disconnectRepo: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input
      const user = await ctx.prisma.user.findFirstOrThrow({
        where: { id: userId },
      })

      const github = (user.github || {}) as GithubInfo

      github.installationId = null as any
      github.repo = ''

      return ctx.prisma.user.update({
        where: { id: userId },
        data: { github },
      })
    }),

  isEarlyAccessCodeValid: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.token.uid, earlyAccessCode: input.code },
      })
      return !!user
    }),
})

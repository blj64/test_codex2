import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
});

const saleSchema = z.object({
  date: z.string().transform((d) => new Date(d)),
  items: z.array(saleItemSchema).min(1),
  notes: z.string().optional(),
  version: z.number().int().optional(),
});

function toDecimal(n: number) {
  return new Prisma.Decimal(n);
}

router.get('/', async (_req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({ include: { items: true } });
    res.json(sales);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = saleSchema.parse(req.body);
    const result = await prisma.$transaction(async (tx) => {
      for (const item of body.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw { status: 404, message: 'Product not found' };
        if (product.quantity.minus(item.quantity).lt(0)) throw { status: 400, message: 'Stock negative' };
        await tx.product.update({
          where: { id: product.id },
          data: { quantity: product.quantity.minus(item.quantity), version: { increment: 1 } },
        });
      }
      let total = new Prisma.Decimal(0);
      const itemsData = [] as any[];
      for (const i of body.items) {
        const product = await tx.product.findUnique({ where: { id: i.productId } });
        itemsData.push({
          productId: i.productId,
          quantity: toDecimal(i.quantity),
          unitPriceSnapshot: product!.unitPrice,
        });
        total = total.plus(product!.unitPrice.times(i.quantity));
      }
      return tx.sale.create({
        data: {
          date: body.date,
          notes: body.notes,
          total,
          items: { create: itemsData },
        },
        include: { items: true },
      });
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const sale = await prisma.sale.findUnique({ where: { id: req.params.id }, include: { items: { include: { product: true } } } });
    if (!sale) return res.status(404).json({ error: { code: 404, message: 'Not found' } });
    res.json(sale);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({ where: { id: req.params.id }, include: { items: { include: { product: true } } } });
      if (!sale) throw { status: 404, message: 'Not found' };
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: item.product.quantity.plus(item.quantity), version: { increment: 1 } },
        });
      }
      await tx.saleItem.deleteMany({ where: { saleId: sale.id } });
      await tx.sale.delete({ where: { id: sale.id } });
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;

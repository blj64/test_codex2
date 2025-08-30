import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  unitType: z.enum(['unit', 'kg']),
  unitPrice: z.number().min(0),
  quantity: z.number().min(0),
  lowStockThreshold: z.number().min(0).optional(),
  version: z.number().int().optional(),
});

function toDecimal(value: number) {
  return new Prisma.Decimal(value);
}

router.get('/', async (req, res, next) => {
  try {
    const { search = '', sort = 'name', order = 'asc', page = '1', pageSize = '10' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);
    const where = search
      ? {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { sku: { contains: search as string, mode: 'insensitive' } },
          ],
        }
      : {};
    const products = await prisma.product.findMany({ where, skip, take, orderBy: { [sort as string]: order } });
    const data = products.map((p) => ({
      ...p,
      isLow: p.lowStockThreshold != null ? p.quantity.lte(p.lowStockThreshold) : false,
    }));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const created = await prisma.product.create({ data: { ...body, unitPrice: toDecimal(body.unitPrice), quantity: toDecimal(body.quantity) } });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: { code: 404, message: 'Not found' } });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = productSchema.parse(req.body);
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { ...body, unitPrice: toDecimal(body.unitPrice), quantity: toDecimal(body.quantity), version: { increment: 1 } },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = productSchema.partial().parse(req.body);
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { ...body, version: { increment: 1 } },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const saleRef = await prisma.saleItem.findFirst({ where: { productId: req.params.id } });
    if (saleRef) return res.status(409).json({ error: { code: 409, message: 'Product referenced by sales' } });
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;

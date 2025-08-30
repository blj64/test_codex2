import { describe, it, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('sales stock logic', () => {
  it('decrements stock on sale creation', async () => {
    const product = await prisma.product.create({
      data: { name: 'Test', sku: 'T1', unitType: 'unit', unitPrice: 1, quantity: 10 },
    });
    await prisma.sale.create({
      data: {
        date: new Date(),
        total: 5,
        items: { create: [{ productId: product.id, quantity: 5, unitPriceSnapshot: 1 }] },
      },
    });
    const refreshed = await prisma.product.findUnique({ where: { id: product.id } });
    expect(refreshed?.quantity.toNumber()).toBe(5);
  });
});

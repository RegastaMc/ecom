-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image" JSONB,
    "buttonText" TEXT NOT NULL DEFAULT 'Shop Now',
    "buttonLink" TEXT NOT NULL DEFAULT '#',
    "type" "BannerType" NOT NULL DEFAULT 'PRIMARY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "banners_type_idx" ON "banners"("type");

-- CreateIndex
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");

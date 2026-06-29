-- CreateEnum
CREATE TYPE "NameMode" AS ENUM ('ACCOUNT_NAME', 'DISPLAY_NAME');

-- AlterTable
ALTER TABLE "OrgMember" ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "nameMode" "NameMode" NOT NULL DEFAULT 'ACCOUNT_NAME';

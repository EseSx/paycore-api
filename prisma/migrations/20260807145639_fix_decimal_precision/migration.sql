-- AlterTable
ALTER TABLE `Account` MODIFY `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `Transaction` MODIFY `amount` DECIMAL(12, 2) NOT NULL;

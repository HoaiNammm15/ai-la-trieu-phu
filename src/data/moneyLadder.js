export const moneyLadder = [200000, 400000, 600000, 1000000, 2000000, 3000000, 6000000, 10000000, 14000000, 22000000, 30000000, 40000000, 60000000, 85000000, 150000000];
export const milestones = [5, 10, 15];
export const formatMoney = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
export const securedMoney = (answered) => answered >= 10 ? moneyLadder[9] : answered >= 5 ? moneyLadder[4] : 0;

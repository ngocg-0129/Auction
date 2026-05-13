export type CreateAuctionInput = { // dữ liệu client gửi lên khi tạo auction
  title: string;
  description?: string;
  startingPrice: number;
  startsAt: string;
  endsAt: string;
};

export type AuctionListQuery = { // query khi xem danh sách auction
  status?: string;
  search?: string;
};
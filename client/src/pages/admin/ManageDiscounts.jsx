import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../conext/AppContext';
import toast from 'react-hot-toast';

const ManageDiscounts = () => {
  const { axios, getToken } = useAppContext();
  const [discounts, setDiscounts] = useState([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [searchType, setSearchType] = useState('name'); // 'name' or 'date'
  const [searchValue, setSearchValue] = useState('');


  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data } = await axios.get('/api/discounts/', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        setDiscounts(data.discounts);
        setFilteredDiscounts(data.discounts);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Lỗi khi tải danh sách mã giảm giá');
    }
  };



  const toggleDiscountStatus = async (id) => {
    try {
      const { data } = await axios.patch(`/api/discounts/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        toast.success('Cập nhật trạng thái mã giảm giá thành công');
        fetchDiscounts();
      } else {
        toast.error(data.message || 'Lỗi khi cập nhật trạng thái mã giảm giá');
      }
    } catch (error) {
      console.error('Error toggling discount status:', error);
      toast.error('Lỗi khi cập nhật trạng thái mã giảm giá');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Quản lý mã giảm giá</h2>

      {/* Danh sách mã giảm giá */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Danh sách mã giảm giá</h3>
          <div className="flex items-center gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="name">Tìm theo tên</option>
              <option value="date">Tìm theo thời gian</option>
            </select>
            {searchType === 'name' ? (
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Nhập mã giảm giá..."
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48"
              />
            ) : (
              <input
                type="date"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            )}
            <button
              onClick={() => {
                if (searchValue.trim() === '') {
                  setFilteredDiscounts(discounts);
                } else {
                  if (searchType === 'name') {
                    const filtered = discounts.filter(discount =>
                      discount.code.toLowerCase().includes(searchValue.toLowerCase())
                    );
                    setFilteredDiscounts(filtered);
                  } else if (searchType === 'date') {
                    const searchDate = new Date(searchValue);
                    const filtered = discounts.filter(discount => {
                      if (!discount.endDate) return false;
                      const endDate = new Date(discount.endDate);
                      return endDate.toDateString() === searchDate.toDateString();
                    });
                    setFilteredDiscounts(filtered);
                  }
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
        {discounts.length === 0 ? (
          <p className="text-gray-500">Chưa có mã giảm giá nào</p>
        ) : filteredDiscounts.length === 0 ? (
          <p className="text-gray-500">Không có kết quả tìm kiếm nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã giảm giá</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng còn lại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn tối thiểu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{discount.code}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{discount.percentage}%</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{discount.quantity || 'Không giới hạn'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {discount.startDate && discount.endDate
                          ? `${new Date(discount.startDate).toLocaleDateString('vi-VN')} - ${new Date(discount.endDate).toLocaleDateString('vi-VN')}`
                          : 'Không giới hạn'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {discount.minOrder ? `${discount.minOrder.toLocaleString()} VND` : 'Không yêu cầu'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {discount.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleDiscountStatus(discount._id)}
                        className={`px-3 py-1 rounded text-white ${
                          discount.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                        title={discount.isActive ? 'Tắt mã giảm giá' : 'Bật mã giảm giá'}
                      >
                        {discount.isActive ? 'Tắt' : 'Bật'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredDiscounts.length > 0 && (
          <div className="flex justify-end mt-4">
            <p className="text-sm text-gray-600">
              Tổng cộng mã giảm giá: <span className="font-semibold">{filteredDiscounts.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDiscounts;

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../conext/AppContext';
import toast from 'react-hot-toast';

const ManageDiscounts = () => {
  const { axios, getToken } = useAppContext();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    percentage: '',
    quantity: '',
    startDate: '',
    endDate: '',
    minOrder: ''
  });
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error('Lỗi khi tải danh sách mã giảm giá');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.percentage) {
      toast.error('Vui lòng nhập mã và phần trăm giảm giá');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (editingDiscount) {
        response = await axios.put(`/api/discounts/${editingDiscount._id}`, formData, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        });
      } else {
        response = await axios.post('/api/discounts/', formData, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        });
      }

      if (response.data.success) {
        toast.success(editingDiscount ? 'Cập nhật mã giảm giá thành công' : 'Thêm mã giảm giá thành công');
        setFormData({ code: '', percentage: '', quantity: '', startDate: '', endDate: '', minOrder: '' });
        setShowForm(false);
        setEditingDiscount(null);
        fetchDiscounts();
      } else {
        toast.error(response.data.message || (editingDiscount ? 'Lỗi khi cập nhật mã giảm giá' : 'Lỗi khi thêm mã giảm giá'));
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error(editingDiscount ? 'Lỗi khi cập nhật mã giảm giá' : 'Lỗi khi thêm mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;

    try {
      const { data } = await axios.delete(`/api/discounts/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        toast.success('Xóa mã giảm giá thành công');
        fetchDiscounts();
      } else {
        toast.error(data.message || 'Lỗi khi xóa mã giảm giá');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Lỗi khi xóa mã giảm giá');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow max-w-4xl mx-auto">
      {/* Header với button nằm sát bên phải */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý mã giảm giá</h2>
        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingDiscount(null);
            setFormData({ code: '', percentage: '', quantity: '', startDate: '', endDate: '', minOrder: '' });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm mã giảm giá mới
        </button>
      </div>

      {/* Add new discount form */}
      {showForm && !isEditMode && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border">
            <h3 className="text-lg font-semibold mb-4">Thêm mã giảm giá mới</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã giảm giá</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder="VD: SAVE20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giảm giá (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="500000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ code: '', percentage: '', quantity: '', startDate: '', endDate: '', minOrder: '' });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Đang thêm...' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit discount form */}
      {showForm && isEditMode && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa mã giảm giá</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã giảm giá</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full p-2 border rounded"
                    placeholder="VD: SAVE20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giảm giá (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đơn hàng tối thiểu</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({...formData, minOrder: e.target.value})}
                    className="w-full p-2 border rounded"
                    placeholder="500000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ code: '', percentage: '', quantity: '', startDate: '', endDate: '', minOrder: '' });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách mã giảm giá */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Danh sách mã giảm giá</h3>
        {discounts.length === 0 ? (
          <p className="text-gray-500">Chưa có mã giảm giá nào</p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map((discount) => (
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditMode(true);
                            setEditingDiscount(discount);
                            setFormData({
                              code: discount.code,
                              percentage: discount.percentage,
                              quantity: discount.quantity || '',
                              startDate: discount.startDate ? discount.startDate.split('T')[0] : '',
                              endDate: discount.endDate ? discount.endDate.split('T')[0] : '',
                              minOrder: discount.minOrder || ''
                            });
                            setShowForm(true);
                          }}
                          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 flex items-center gap-1"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteDiscount(discount._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {discounts.length > 0 && (
          <div className="flex justify-end mt-4">
            <p className="text-sm text-gray-600">
              Tổng cộng mã giảm giá: <span className="font-semibold">{discounts.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDiscounts;

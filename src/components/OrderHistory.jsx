import { useState, useEffect } from 'react';
import { LuPackage, LuX, LuCheck, LuDollarSign } from 'react-icons/lu';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import api from '../api/axios';

const STATUS_TO_STEP = {
  solicitado: 0,
  cotizado: 1,
  aceptado: 2,
  en_produccion: 3,
  listo: 4,
  entregado: 5,
  rechazado: 0,
};

const STATUS_STYLE = {
  solicitado: { bg: 'bg-yellow-50 text-yellow-600 border-yellow-100', dot: 'bg-yellow-500' },
  cotizado: { bg: 'bg-yellow-50 text-yellow-600 border-yellow-100', dot: 'bg-yellow-500' },
  aceptado: { bg: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500' },
  en_produccion: { bg: 'bg-purple-50 text-purple-600 border-purple-100', dot: 'bg-purple-500' },
  listo: { bg: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-500' },
  entregado: { bg: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' },
  rechazado: { bg: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' },
};

const STATUS_LABEL = {
  solicitado: 'Solicitado',
  cotizado: 'Cotizado',
  aceptado: 'Aprobado',
  en_produccion: 'En producción',
  listo: 'Listo',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
};

export default function OrderHistory({ onNavigate }) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language] || {};

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (showOrderModal) {
      document.body.style.overflow = 'hidden';
      fetchOrders();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showOrderModal]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data.data || data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponderCotizacion = async (orderId, accion) => {
    const confirmacion = accion === 'accept'
      ? '¿Estás de acuerdo con el precio? El pedido pasará a aprobación para pago.'
      : '¿Seguro que deseas rechazar esta cotización?';

    if (!window.confirm(confirmacion)) return;

    setRespondingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/respond`, {
        action: accion,
        note: accion === 'reject' ? 'Rechazado por el cliente desde la web.' : ''
      });
      alert(accion === 'accept' ? '¡Cotización aceptada! Por favor sube tu comprobante de pago.' : 'Cotización rechazada.');
      fetchOrders();
    } catch (err) {
      console.error('Error al responder:', err);
      alert('Hubo un error al procesar tu respuesta.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleUploadProof = async (orderId, file) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('proof', file);
    try {
      await api.post(`/orders/${orderId}/payment-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Comprobante enviado con éxito. Moran Creative validará tu pago pronto.');
      fetchOrders(); // Refrescar para detectar el archivo y actualizar la UI automáticamente
    } catch (err) {
      console.error('Error al subir:', err);
      alert('Hubo un error al subir el comprobante.');
    } finally {
      setIsUploading(false);
    }
  };

  const STEPS = [
    t.cotizado || 'Cotizado',
    t.aprobado || 'Aprobado',
    t.enProduccion || 'En producción',
    t.listo || 'Listo',
    t.entregado || 'Entregado',
  ];

  const parseMaterialFromNotes = (notes = '') => {
    const match = notes.match(/material:\s*(.+)/i);
    return match ? match[1].trim() : '';
  };

  const getOrderName = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items[0].piece_name || order.end_use || 'Sin nombre';
    }
    return order.end_use || 'Sin nombre';
  };

  const getMaterial = (order) => {
    if (order.items && order.items.length > 0) {
      const item = order.items[0];
      const mat = item.material?.name || parseMaterialFromNotes(item.item_notes);
      const color = item.preferred_color || item.color?.name || '';
      return [mat, color].filter(Boolean).join(' ') || '—';
    }
    return '—';
  };

  return (
    <>
      <button
        onClick={() => setShowOrderModal(true)}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-semibold text-sm"
      >
        <LuPackage size={18} className="text-blue-600" />
        {t.pedidos || 'Pedidos'}
        <span className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -ml-1">
          {orders.length > 0 ? orders.length : '·'}
        </span>
      </button>

      {showOrderModal && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative animate-slideUp">

            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl shrink-0">
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">{t.misPedidos || 'Mis Pedidos'}</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setShowOrderModal(false); onNavigate?.('upload'); }}
                  className="px-5 py-2.5 bg-[#de5c21] hover:bg-[#c24b17] text-white rounded-lg font-medium shadow-sm transition-all hover:shadow text-sm flex items-center gap-1.5"
                >
                  {t.solicitarImpresion || '+ Solicitar'}
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-50 hover:bg-gray-100 p-2 rounded-lg text-gray-500 hover:text-gray-800 transition-colors border border-gray-200"
                >
                  <LuX size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-b-xl hide-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                  Cargando tus pedidos de MakerLab...
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <LuPackage size={48} className="mb-4 opacity-30" />
                  <p className="text-lg font-medium">No tienes pedidos aún</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {orders.map((order) => {
                    const currentStep = STATUS_TO_STEP[order.status] ?? 0;
                    const style = STATUS_STYLE[order.status] || STATUS_STYLE.solicitado;
                    const label = STATUS_LABEL[order.status] || order.status;

                    // INTELIGENCIA: Revisar si ya existe el comprobante en la lista de archivos
                    const hasProof = order.files?.some(file => file.original_name.includes('Comprobante'));

                    return (
                      <div key={order.id} className="pt-8 pb-10 px-8 border-b border-gray-100 last:border-b-0 hover:bg-slate-50/50 transition-colors group">

                        <div className="flex justify-between items-start mb-10 w-full pl-2">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 max-w-3xl">
                            <span className="text-gray-500 font-medium whitespace-nowrap">{order.ticket}</span>
                            <h3 className="text-lg font-bold text-gray-800 truncate">{getOrderName(order)}</h3>
                            <span className="text-gray-400 font-medium whitespace-nowrap hidden md:inline">— {getMaterial(order)}</span>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 w-fit border ${style.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                              {label}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-gray-900 shrink-0 select-none">
                            {order.quoted_price ? `$${Number(order.quoted_price).toFixed(0)} MXN` : '—'}
                          </div>
                        </div>

                        {/* ACCIÓN: COTIZACIÓN DISPONIBLE */}
                        {order.status === 'cotizado' && (
                          <div className="mb-10 ml-2 p-5 bg-blue-50 rounded-xl border border-blue-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeIn">
                            <div className="flex items-center gap-3 text-left">
                              <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <LuDollarSign size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Cotización Lista</p>
                                <p className="text-sm text-slate-700 font-medium">Precio final: <span className="font-bold text-slate-900">${Number(order.quoted_price).toFixed(2)} MXN</span></p>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                              <button
                                disabled={respondingId === order.id}
                                onClick={() => handleResponderCotizacion(order.id, 'reject')}
                                className="flex-1 md:flex-none px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-xs hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <LuX size={14} /> RECHAZAR
                              </button>
                              <button
                                disabled={respondingId === order.id}
                                onClick={() => handleResponderCotizacion(order.id, 'accept')}
                                className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
                              >
                                <LuCheck size={14} /> ACEPTAR
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ACCIÓN DINÁMICA: SUBIR O MENSAJE DE ÉXITO */}
                        {order.status === 'aceptado' && (
                          <div className={`mb-10 ml-2 p-5 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeIn transition-all duration-300 ${hasProof ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'}`}>
                            <div className="flex items-center gap-3 text-left">
                              <div className={`${hasProof ? 'bg-green-600' : 'bg-indigo-600'} p-2 rounded-lg text-white transition-colors`}>
                                {hasProof ? <FiCheckCircle size={20} /> : <FiUploadCloud size={20} />}
                              </div>
                              <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${hasProof ? 'text-green-600' : 'text-indigo-600'}`}>
                                  {hasProof ? 'Pago en Revisión' : 'Paso Final: Confirmar Pago'}
                                </p>
                                <p className="text-sm text-slate-700 font-medium">
                                  {hasProof
                                    ? 'Hemos recibido tu comprobante. En cuanto validemos la transferencia iniciaremos la impresión.'
                                    : 'Por favor sube tu captura de transferencia para que podamos encender las impresoras.'}
                                </p>
                              </div>
                            </div>

                            {!hasProof ? (
                              <>
                                <input
                                  type="file"
                                  id={`upload-proof-${order.id}`}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleUploadProof(order.id, e.target.files[0])}
                                />
                                <button
                                  disabled={isUploading}
                                  onClick={() => document.getElementById(`upload-proof-${order.id}`).click()}
                                  className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                  {isUploading ? 'SUBIENDO...' : 'SUBIR COMPROBANTE'}
                                </button>
                              </>
                            ) : (
                              <div className="px-6 py-2 bg-green-600 text-white rounded-lg font-black text-[10px] uppercase tracking-tighter shadow-md select-none">
                                Comprobante Enviado
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timeline visual */}
                        <div className="w-full max-w-4xl px-2 mb-2">
                          <div className="flex items-center justify-between w-full relative">
                            {STEPS.map((stepLabel, idx) => {
                              const isCompleted = idx < currentStep;
                              const isCurrent = idx === currentStep - 1;
                              const isLast = idx === STEPS.length - 1;
                              const isLineActive = idx < currentStep - 1;

                              return (
                                <div key={idx} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                                  <div className="flex flex-col items-center relative z-10">
                                    <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-bold transition-all border-[2px] ${isCompleted
                                        ? 'bg-[#de5c21] border-[#de5c21] text-white shadow-sm'
                                        : isCurrent
                                          ? 'bg-white border-[#de5c21] text-[#de5c21] ring-4 ring-[#de5c21]/10'
                                          : 'bg-white border-gray-200 text-gray-400'
                                      }`}>
                                      {isCompleted ? <LuCheck size={18} strokeWidth={3} /> : idx + 1}
                                    </div>
                                    <p className={`text-[13px] mt-4 font-semibold absolute top-[40px] whitespace-nowrap text-center ${isCompleted ? 'text-gray-500' : isCurrent ? 'text-[#de5c21]' : 'text-gray-400'
                                      }`}>
                                      {stepLabel}
                                    </p>
                                  </div>
                                  {!isLast && (
                                    <div className={`h-[2px] flex-1 -mx-1 z-0 rounded-full transition-all duration-300 ${isLineActive ? 'bg-[#de5c21]' : 'bg-gray-200'
                                      }`}></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
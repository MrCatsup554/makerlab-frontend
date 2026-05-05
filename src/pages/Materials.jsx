import React, { useState, useEffect } from 'react';
import { FiBox, FiDroplet, FiZap, FiShield, FiStar, FiChevronDown, FiChevronUp, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import api from '../api/axios';

// Map of extra detail info keyed by material name — static enrichment
const materialDetails = {
  'PLA': {
    icon: <FiDroplet size={24} />,
    gradient: 'from-green-500 to-emerald-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    features: ['Biodegradable y ecológico', 'Fácil de imprimir', 'Múltiples colores disponibles', 'Acabado suave', 'Post-procesado sencillo', 'Temp. de impresión: 190-220°C'],
    bestFor: 'Prototipos, maquetas, decoración, proyectos escolares',
    quality: 'Buena — ideal para prototipos rápidos',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=600&auto=format&fit=crop',
  },
  'PLA+': {
    icon: <FiZap size={24} />,
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    features: ['Mayor resistencia que el PLA estándar', 'Mejor adherencia entre capas', 'Menos frágil', 'Misma facilidad de impresión', 'Amplia gama de colores', 'Temp. de impresión: 200-230°C'],
    bestFor: 'Piezas funcionales ligeras, prototipos avanzados, piezas de exhibición',
    quality: 'Muy buena — balance perfecto calidad/precio',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop',
  },
  'ABS': {
    icon: <FiShield size={24} />,
    gradient: 'from-orange-500 to-red-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    features: ['Alta resistencia mecánica', 'Resistente al calor (hasta 100°C)', 'Resistente a impactos', 'Excelente para piezas funcionales', 'Se puede lijar y pintar', 'Temp. de impresión: 230-250°C'],
    bestFor: 'Piezas funcionales, herramientas, soportes, carcasas, piezas automotrices',
    quality: 'Excelente — grado industrial',
    image: 'https://images.unsplash.com/photo-1563770660941-10a63607eca0?q=80&w=600&auto=format&fit=crop',
  },
  'PETG': {
    icon: <FiShield size={24} />,
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    features: ['Combina facilidad de PLA con resistencia de ABS', 'Resistente a humedad y químicos', 'Flexible sin ser frágil', 'Excelente transparencia', 'Apto para uso alimentario', 'Temp. de impresión: 220-250°C'],
    bestFor: 'Contenedores, piezas mecánicas, piezas transparentes, usos exteriores',
    quality: 'Excelente — versátil y duradero',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600&auto=format&fit=crop',
  },
  'Resina Estándar': {
    icon: <FiStar size={24} />,
    gradient: 'from-purple-500 to-pink-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    features: ['Detalles ultra finos (hasta 0.025mm)', 'Acabado liso y profesional', 'Resolución 4K-8K', 'Colores vibrantes', 'Ideal para miniaturas', 'Curado UV rápido'],
    bestFor: 'Miniaturas, joyería, figuras detalladas, modelos dentales, piezas artísticas',
    quality: 'Premium — profesional',
    image: 'https://images.unsplash.com/photo-1599153066743-08c9b10d1a1a?q=80&w=600&auto=format&fit=crop',
  },
  'TPU Flexible': {
    icon: <FiZap size={24} />,
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    features: ['Material flexible y elástico', 'Resistente a la abrasión', 'Absorbe vibraciones', 'Resistente a aceites y grasas', 'Duradero bajo estrés repetido', 'Temp. de impresión: 220-250°C'],
    bestFor: 'Fundas de teléfono, juntas, sellos, suelas, empuñaduras, wearables',
    quality: 'Excelente — especializado',
    image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?q=80&w=600&auto=format&fit=crop',
  },
};

const defaultDetail = {
  icon: <FiBox size={24} />,
  gradient: 'from-gray-500 to-slate-600',
  bgLight: 'bg-gray-50',
  textColor: 'text-gray-600',
  borderColor: 'border-gray-200',
  features: [],
  bestFor: 'Consultar con nuestro equipo',
  quality: 'Consultar disponibilidad',
  image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=600&auto=format&fit=crop',
};

export default function Materials({ onNavigate }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get('/materials');
        setMaterials(res.data || []);
      } catch (err) {
        console.error('Error al cargar materiales:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const categories = ['Todos', ...new Set(materials.map(m => m.category).filter(Boolean))];
  const filtered = selectedCategory === 'Todos' ? materials : materials.filter(m => m.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      <Header onNavigate={onNavigate} currentPage="materials" />

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 text-white">
            <FiBox size={28} />
          </div>
          <h1 className="text-5xl font-black mb-3 text-gray-900 tracking-tight">
            Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Materiales</span>
          </h1>
          <div className="h-1 w-20 bg-purple-600 mx-auto mb-4 rounded-full" />
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Explora nuestros materiales de impresión 3D. Cada uno está diseñado para diferentes necesidades y aplicaciones.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Materials Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.filter(m => m.is_active).map(material => {
              const detail = materialDetails[material.name] || defaultDetail;
              const isExpanded = expandedId === material.id;

              return (
                <div
                  key={material.id}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ${detail.borderColor}`}
                >
                  {/* Card Header with gradient */}
                  <div className={`bg-gradient-to-br ${detail.gradient} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                          {detail.icon}
                        </div>
                        {material.category && (
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest">
                            {material.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">{material.name}</h3>
                      <p className="text-white/80 text-sm mt-1 leading-relaxed line-clamp-2">
                        {material.description}
                      </p>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="px-6 -mt-4 relative z-10">
                    <div className={`inline-flex items-center gap-2 px-4 py-2.5 ${detail.bgLight} ${detail.textColor} rounded-xl border ${detail.borderColor} shadow-sm`}>
                      <span className="text-xl font-black">${material.price_per_gram}</span>
                      <span className="text-xs font-bold opacity-70">/ gramo</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pt-4 flex-1 flex flex-col">
                    {/* Quick Info */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-2 h-2 rounded-full ${material.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-bold text-gray-500">{material.is_active ? 'Disponible' : 'No disponible'}</span>
                    </div>

                    {/* Expand / Collapse for details */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : material.id)}
                      className="flex items-center justify-between w-full text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors py-2 border-t border-gray-100"
                    >
                      <span>{isExpanded ? 'Ocultar detalles' : 'Ver características'}</span>
                      {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="animate-fadeIn mt-3 space-y-4">
                        {/* Features */}
                        {detail.features.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Características</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {detail.features.map((feat, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-gradient-to-r ${detail.gradient}`} />
                                  <span className="text-sm text-gray-600">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Best For */}
                        <div className={`p-3 ${detail.bgLight} rounded-xl`}>
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mejor para</h4>
                          <p className="text-sm text-gray-700 font-medium">{detail.bestFor}</p>
                        </div>

                        {/* Quality */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-bold">Calidad:</span>
                          <span className={`font-black ${detail.textColor}`}>{detail.quality}</span>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-4">
                      <button
                        onClick={() => onNavigate?.('upload')}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest bg-gradient-to-r ${detail.gradient} hover:opacity-90 transition-all shadow-md active:scale-[0.98]`}
                      >
                        Usar este material <FiArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <FiBox size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg font-medium">No hay materiales en esta categoría.</p>
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
      <ChatWidget />
    </div>
  );
}

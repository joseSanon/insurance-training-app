import React, { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, Shield, Plus, Edit2, Trash2, X, Check, ChevronRight, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const INITIAL_TERMS = [
  {
    id: 1,
    word: "Prime d'assurance",
    definition: "Somme versée par l'assuré à l'assureur en contrepartie de la garantie qui lui est accordée.",
    category: "Assurance Vie",
    subCategory: "Concepts généraux",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 2,
    word: "Sinistre",
    definition: "Événement dommageable prévu au contrat et donnant lieu à une intervention de l'assureur.",
    category: "Assurance Non-Vie",
    subCategory: "Gestion des sinistres",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 3,
    word: "Franchise",
    definition: "Montant qui reste à la charge de l'assuré en cas de sinistre, non remboursé par l'assureur.",
    category: "Assurance Auto",
    subCategory: "Indemnisation",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 4,
    word: "Bénéficiaire",
    definition: "Personne désignée pour recevoir le capital ou la rente en cas de décès de l'assuré.",
    category: "Assurance Vie",
    subCategory: "Acteurs",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 5,
    word: "Rétrocession",
    definition: "Opération par laquelle un réassureur cède à son tour une partie des risques qu'il a acceptés.",
    category: "Réassurance",
    subCategory: "Techniques de réassurance",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 6,
    word: "Responsabilité civile",
    definition: "Obligation de réparer les dommages causés à autrui par sa faute, négligence ou imprudence.",
    category: "MRH",
    subCategory: "Garanties",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 7,
    word: "Valeur de rachat",
    definition: "Montant que l'assureur verse à l'assuré qui souhaite mettre fin à son contrat avant son terme.",
    category: "Assurance Vie",
    subCategory: "Épargne",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 8,
    word: "Bonus-malus",
    definition: "Système de réduction ou majoration de la prime en fonction du nombre de sinistres responsables.",
    category: "Assurance Auto",
    subCategory: "Tarification",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 9,
    word: "Traité de réassurance",
    definition: "Contrat par lequel un assureur (cédante) transfère une partie de ses risques à un réassureur selon des conditions définies.",
    category: "Réassurance",
    subCategory: "Contrats",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 10,
    word: "Quote-part",
    definition: "Type de réassurance proportionnelle où le réassureur prend un pourcentage fixe de tous les risques couverts par l'assureur.",
    category: "Réassurance",
    subCategory: "Techniques de réassurance",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 11,
    word: "Excédent de sinistre",
    definition: "Forme de réassurance non proportionnelle où le réassureur intervient au-delà d'un certain montant de sinistre.",
    category: "Réassurance",
    subCategory: "Techniques de réassurance",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 12,
    word: "Cédante",
    definition: "Compagnie d'assurance qui cède une partie de ses risques à un réassureur pour réduire son exposition.",
    category: "Réassurance",
    subCategory: "Acteurs",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  },
  {
    id: 13,
    word: "Commission de réassurance",
    definition: "Rémunération versée par le réassureur à la cédante pour couvrir ses frais d'acquisition et de gestion des contrats.",
    category: "Réassurance",
    subCategory: "Aspects financiers",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-15T10:30:00Z"
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');
  const [terms, setTerms] = useState([]);

  const [newTerm, setNewTerm] = useState({
    word: '',
    definition: '',
    category: '',
    subCategory: ''
  });

  // Charger les données au démarrage
  useEffect(() => {
    const savedTerms = localStorage.getItem('insuranceTerms');
    if (savedTerms) {
      setTerms(JSON.parse(savedTerms));
    } else {
      setTerms(INITIAL_TERMS);
      localStorage.setItem('insuranceTerms', JSON.stringify(INITIAL_TERMS));
    }
  }, []);

  // Sauvegarder les données à chaque modification
  useEffect(() => {
    if (terms.length > 0) {
      localStorage.setItem('insuranceTerms', JSON.stringify(terms));
    }
  }, [terms]);

  const categories = useMemo(() => {
    const cats = {};
    terms.forEach(term => {
      if (!cats[term.category]) {
        cats[term.category] = new Set();
      }
      cats[term.category].add(term.subCategory);
    });
    const result = {};
    Object.keys(cats).forEach(cat => {
      result[cat] = Array.from(cats[cat]);
    });
    return result;
  }, [terms]);

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) {
      return { primary: [], secondary: [] };
    }

    const searchWithoutAccents = removeAccents(searchTerm.toLowerCase());
    
    const primaryResults = terms.filter(term => 
      removeAccents(term.word.toLowerCase()).includes(searchWithoutAccents) ||
      removeAccents(term.category.toLowerCase()).includes(searchWithoutAccents) ||
      removeAccents(term.subCategory.toLowerCase()).includes(searchWithoutAccents)
    );
    
    const secondaryResults = terms.filter(term => {
      const isInPrimary = primaryResults.some(p => p.id === term.id);
      return !isInPrimary && removeAccents(term.definition.toLowerCase()).includes(searchWithoutAccents);
    });
    
    return {
      primary: primaryResults.sort((a, b) => a.word.localeCompare(b.word)),
      secondary: secondaryResults.sort((a, b) => a.word.localeCompare(b.word))
    };
  }, [terms, searchTerm]);

  const handleAddTerm = () => {
    if (newTerm.word && newTerm.definition && newTerm.category && newTerm.subCategory) {
      const now = new Date().toISOString();
      
      if (editingTerm) {
        setTerms(terms.map(term => 
          term.id === editingTerm.id 
            ? { ...newTerm, id: editingTerm.id, createdAt: term.createdAt, updatedAt: now }
            : term
        ));
        setEditingTerm(null);
      } else {
        const maxId = terms.length > 0 ? Math.max(...terms.map(t => t.id)) : 0;
        setTerms([...terms, { ...newTerm, id: maxId + 1, createdAt: now, updatedAt: now }]);
      }
      setNewTerm({ word: '', definition: '', category: '', subCategory: '' });
      setShowAddModal(false);
    }
  };

  const handleEditTerm = (term) => {
    setEditingTerm(term);
    setNewTerm({
      word: term.word,
      definition: term.definition,
      category: term.category,
      subCategory: term.subCategory
    });
    setShowAddModal(true);
  };

  const handleDeleteTerm = (id) => {
    setTerms(terms.filter(term => term.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const now = new Date().toISOString();
        const maxId = terms.length > 0 ? Math.max(...terms.map(t => t.id)) : 0;

        const newTerms = jsonData.map((row, index) => {
          const word = row.Mot || row.mot || row.Terme || row.terme || '';
          const definition = row.Définition || row.Definition || row.définition || row.definition || '';
          const category = row.Catégorie || row.Categorie || row.catégorie || row.categorie || row.Thématique || row.Thematique || '';
          const subCategory = row['Sous-catégorie'] || row['Sous-categorie'] || row['sous-catégorie'] || row['sous-categorie'] || row['Sous-thématique'] || row['Sous-thematique'] || '';

          if (!word || !definition || !category || !subCategory) {
            throw new Error(`Ligne ${index + 2} : certaines colonnes sont manquantes ou vides`);
          }

          return {
            id: maxId + index + 1,
            word: word.trim(),
            definition: definition.trim(),
            category: category.trim(),
            subCategory: subCategory.trim(),
            createdAt: now,
            updatedAt: now
          };
        });

        setTerms([...terms, ...newTerms]);
        setShowImportModal(false);
        setImportError('');
        e.target.value = '';
      } catch (error) {
        setImportError(error.message || 'Erreur lors de la lecture du fichier. Vérifiez le format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Mot': 'Exemple terme',
        'Définition': 'Définition du terme',
        'Catégorie': 'Assurance Vie',
        'Sous-catégorie': 'Concepts généraux'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Termes');
    XLSX.writeFile(workbook, 'template_termes_assurance.xlsx');
  };

  const categoryIcons = {
    "Assurance Vie": "💼",
    "Assurance Non-Vie": "🛡️",
    "Réassurance": "🔄",
    "Assurance Auto": "🚗",
    "MRH": "🏠"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Formation Assurance
                </h1>
                <p className="text-sm text-gray-500">Votre dictionnaire professionnel</p>
              </div>
            </div>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isAdmin 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isAdmin ? 'Mode Admin' : 'Mode Utilisateur'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm">
          <button
            onClick={() => {
              setActiveTab('search');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Recherche</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('categories');
              setSearchTerm('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Thématiques</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un terme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg shadow-sm"
              />
            </div>

            {isAdmin && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingTerm(null);
                    setNewTerm({ word: '', definition: '', category: '', subCategory: '' });
                    setShowAddModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter un terme</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(true);
                    setImportError('');
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>Importer Excel</span>
                </button>
              </div>
            )}

            <div className="grid gap-4">
              {!searchTerm ? (
                terms.sort((a, b) => a.word.localeCompare(b.word)).map(term => (
                  <div key={term.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{term.word}</h3>
                          <span className="text-2xl">{categoryIcons[term.category] || '📚'}</span>
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">{term.definition}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {term.category}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {term.subCategory}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditTerm(term)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTerm(term.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {searchResults.primary.map(term => (
                    <div key={term.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{term.word}</h3>
                            <span className="text-2xl">{categoryIcons[term.category] || '📚'}</span>
                          </div>
                          <p className="text-gray-600 mb-3 leading-relaxed">{term.definition}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              {term.category}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              {term.subCategory}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTerm(term)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTerm(term.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {searchResults.secondary.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                          Résultats complémentaires
                        </h3>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      
                      <div className="grid gap-3">
                        {searchResults.secondary.map(term => (
                          <div key={term.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:bg-gray-100 transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-600">{term.word}</h3>
                                  <span className="text-xl opacity-60">{categoryIcons[term.category] || '📚'}</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-3 leading-relaxed italic">{term.definition}</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2.5 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                                    {term.category}
                                  </span>
                                  <span className="px-2.5 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                                    {term.subCategory}
                                  </span>
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleEditTerm(term)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTerm(term.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchResults.primary.length === 0 && searchResults.secondary.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Aucun terme trouvé</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {!selectedCategory ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(categories).map(category => {
                  const termCount = terms.filter(t => t.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-4xl">{categoryIcons[category] || '📚'}</span>
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{category}</h3>
                      <p className="text-sm text-gray-500">
                        {categories[category].length} sous-thématique{categories[category].length > 1 ? 's' : ''} • {termCount} terme{termCount > 1 ? 's' : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : !selectedSubCategory ? (
              <div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2"
                >
                  <ChevronRight className="w-5 h-5 transform rotate-180" />
                  <span>Retour aux catégories</span>
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <span className="text-4xl">{categoryIcons[selectedCategory] || '📚'}</span>
                  <span>{selectedCategory}</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {categories[selectedCategory].map(subCat => {
                    const subCatTermCount = terms.filter(t => t.category === selectedCategory && t.subCategory === subCat).length;
                    return (
                      <button
                        key={subCat}
                        onClick={() => setSelectedSubCategory(subCat)}
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-800">{subCat}</h3>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {subCatTermCount} terme{subCatTermCount > 1 ? 's' : ''}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedSubCategory(null)}
                  className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2"
                >
                  <ChevronRight className="w-5 h-5 transform rotate-180" />
                  <span>Retour aux sous-thématiques</span>
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedSubCategory}</h2>
                <p className="text-gray-500 mb-6">{selectedCategory}</p>
                <div className="grid gap-4">
                  {terms.filter(t => t.category === selectedCategory && t.subCategory === selectedSubCategory).map(term => (
                    <div key={term.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{term.word}</h3>
                          <p className="text-gray-600 leading-relaxed">{term.definition}</p>
                        </div>
                        {isAdmin && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTerm(term)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTerm(term.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        <div className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Formation Assurance - Tous droits réservés
        </div>
      </footer>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTerm ? 'Modifier le terme' : 'Ajouter un terme'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTerm(null);
                  setNewTerm({ word: '', definition: '', category: '', subCategory: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terme</label>
                <input
                  type="text"
                  value={newTerm.word}
                  onChange={(e) => setNewTerm({ ...newTerm, word: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  placeholder="Ex: Prime d'assurance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Définition</label>
                <textarea
                  value={newTerm.definition}
                  onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none resize-none"
                  rows="4"
                  placeholder="Définition complète du terme..."
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={newTerm.category}
                    onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Assurance Vie">Assurance Vie</option>
                    <option value="Assurance Non-Vie">Assurance Non-Vie</option>
                    <option value="Réassurance">Réassurance</option>
                    <option value="Assurance Auto">Assurance Auto</option>
                    <option value="MRH">MRH</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sous-catégorie</label>
                  <input
                    type="text"
                    value={newTerm.subCategory}
                    onChange={(e) => setNewTerm({ ...newTerm, subCategory: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:outline-none"
                    placeholder="Ex: Concepts généraux"
                  />
                </div>
              </div>
              
              <button
                onClick={handleAddTerm}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Check className="w-5 h-5" />
                <span>{editingTerm ? 'Enregistrer les modifications' : 'Ajouter le terme'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Importer des termes depuis Excel
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Format du fichier Excel</h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Votre fichier Excel doit contenir les colonnes suivantes :
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Mot</strong> : le terme à définir</li>
                      <li>• <strong>Définition</strong> : la définition complète</li>
                      <li>• <strong>Catégorie</strong> : la thématique principale</li>
                      <li>• <strong>Sous-catégorie</strong> : la sous-thématique</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Télécharger le modèle Excel</span>
              </button>

              {importError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-800">{importError}</p>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Cliquez pour sélectionner un fichier
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Formats acceptés : .xlsx, .xls
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCMS } from '../../contexts/CMSContext';
import { WebsiteProject } from '../../types';
import { WebsiteSelector } from '../../components/WebsiteSelector';
import { api } from '../../services/api';

type WizardStep = 'info' | 'domain' | 'languages' | 'theme' | 'review';

interface WebsiteFormData {
  name: string;
  client: string;
  description: string;
  domain: string;
  subdomain: string;
  defaultLanguage: 'en' | 'fr' | 'ar';
  languages: ('en' | 'fr' | 'ar')[];
  theme: 'minimal' | 'business' | 'blog';
}

const DRAFT_STORAGE_KEY = 'website_creation_draft';

// ============================================
// HELPER FUNCTIONS
// ============================================
const extractSubdomain = (domain: string): string => {
  if (!domain) return '';
  // Extract everything before the first dot
  const parts = domain.split('.');
  return parts[0] || '';
};

export const WebsitesPage: React.FC = () => {
  const { websites, selectedWebsite, setSelectedWebsite, setWebsites } = useCMS();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<WebsiteProject | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [domainStatus, setDomainStatus] = useState<'checking' | 'available' | 'taken' | null>(null);

  const [formData, setFormData] = useState<WebsiteFormData>({
    name: '',
    client: '',
    description: '',
    domain: '',
    subdomain: '',
    defaultLanguage: 'en',
    languages: ['en'],
    theme: 'minimal',
  });

  const [editFormData, setEditFormData] = useState<{
    name: string;
    client: string;
    domain: string;
    subdomain: string;
    theme: 'minimal' | 'business' | 'blog';
  }>({
    name: '',
    client: '',
    domain: '',
    subdomain: '',
    theme: 'minimal',
  });

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    fetchWebsites();
    // Load draft from localStorage if exists
    const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // Invalid draft, ignore
      }
    }
  }, []);

  // ============================================
  // 1. FETCH WEBSITES FROM API
  // ============================================
  const fetchWebsites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getWebsites();
      const websitesFromApi: WebsiteProject[] = data || [];
      setWebsites(websitesFromApi);

      if (selectedWebsite) {
        const matchedWebsite = websitesFromApi.find((website) => website.id === selectedWebsite.id);
        if (matchedWebsite) {
          setSelectedWebsite(matchedWebsite);
        } else {
          setSelectedWebsite(null);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load websites';
      setError(errorMsg);
      console.error('Fetch websites error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 2. NOTIFICATION HELPER
  // ============================================
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ============================================
  // 3. WIZARD CONFIGURATION
  // ============================================
  const steps: { key: WizardStep; label: string; number: number }[] = [
    { key: 'info', label: 'Basic Information', number: 1 },
    { key: 'domain', label: 'Domain Configuration', number: 2 },
    { key: 'languages', label: 'Languages', number: 3 },
    { key: 'theme', label: 'Theme Selection', number: 4 },
    { key: 'review', label: 'Review & Create', number: 5 },
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);

  const goToNextStep = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      showNotification('error', validationError);
      return;
    }

    // Save draft before moving
    saveDraft();

    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  // ============================================
  // 4. DRAFT MANAGEMENT (localStorage)
  // ============================================
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch (e) {
      console.warn('Failed to save draft:', e);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // ============================================
  // 5. VALIDATION
  // ============================================
  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 'info':
        if (!formData.name.trim()) return 'Website name is required';
        if (formData.name.length < 3) return 'Website name must be at least 3 characters';
        break;

      case 'domain':
        if (!formData.domain.trim()) return 'Domain is required';
        if (!isValidDomain(formData.domain)) return 'Please enter a valid domain';
        if (domainStatus === 'taken') return 'This domain is already in use';
        break;

      case 'languages':
        if (formData.languages.length === 0) return 'At least one language must be selected';
        if (!formData.languages.includes(formData.defaultLanguage)) {
          return 'Default language must be included in supported languages';
        }
        break;

      case 'theme':
        // Theme is always valid
        break;

      case 'review':
        // All validation already done
        break;
    }
    return null;
  };

  const isValidDomain = (domain: string): boolean => {
    // Simple domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) || domain.includes('localhost');
  };

  // ============================================
  // 6. DOMAIN CHECKING
  // ============================================
  const checkDomainAvailability = async (domain: string) => {
    if (!isValidDomain(domain)) {
      setDomainStatus(null);
      return;
    }

    setDomainStatus('checking');

    // Simulate domain check (in real app, call backend API)
    setTimeout(() => {
      const isTaken = websites.some(w => w.domain === domain);
      setDomainStatus(isTaken ? 'taken' : 'available');
    }, 500);
  };

  // ============================================
  // 7. LANGUAGE MANAGEMENT
  // ============================================
  const handleLanguageToggle = (language: 'en' | 'fr' | 'ar') => {
    setFormData(prev => {
      const newLanguages = prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language];

      // Ensure default language is always included
      if (!newLanguages.includes(prev.defaultLanguage)) {
        return { ...prev, languages: [...newLanguages, prev.defaultLanguage] };
      }

      return { ...prev, languages: newLanguages };
    });

    saveDraft();
  };

  // ============================================
  // 8. SELECT WEBSITE
  // ============================================
  const handleSelectWebsite = (website: WebsiteProject) => {
    setSelectedWebsite(website);
  };

  // ============================================
  // 9. CREATE WEBSITE (FINAL SUBMIT)
  // ============================================
  const handleCreateWebsite = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      showNotification('error', validationError);
      return;
    }

    setIsCreating(true);

    try {
      const websiteData = {
        name: formData.name,
        client: formData.client,
        domain: formData.domain,
        subdomain: formData.subdomain,
        status: 'published' as const,
        defaultLanguage: formData.defaultLanguage,
        languages: formData.languages,
        theme: formData.theme,
      };

      const response = await api.createWebsite(websiteData);
      
      showNotification('success', `Website "${formData.name}" created successfully!`);

      // Clear draft
      clearDraft();

      // Reset wizard
      resetWizard();
      setShowWizard(false);

      // Refresh websites and auto-select the new one
      await fetchWebsites();

      // Redirect to dashboard with new website ID
      if (response.website?.id) {
        setSelectedWebsite(response.website);
        navigate(`/dashboard?website_id=${response.website.id}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create website';
      showNotification('error', errorMsg);
      console.error('Create website error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // ============================================
  // 10. RESET WIZARD
  // ============================================
  const resetWizard = () => {
    setFormData({
      name: '',
      client: '',
      description: '',
      domain: '',
      subdomain: '',
      defaultLanguage: 'en',
      languages: ['en'],
      theme: 'minimal',
    });
    setCurrentStep('info');
    setDomainStatus(null);
    clearDraft();
  };

  // ============================================
  // 11. EDIT WEBSITE
  // ============================================
  const handleEditWebsite = (website: WebsiteProject) => {
    setEditingWebsite(website);
    setEditFormData({
      name: website.name,
      client: website.client,
      domain: website.domain,
      subdomain: website.subdomain || extractSubdomain(website.domain),
      theme: website.theme,
    });
    setShowEditModal(true);
  };

  const handleSaveWebsite = async () => {
    if (!editingWebsite || !editFormData.name.trim()) {
      showNotification('error', 'Website name is required');
      return;
    }

    try {
      const updateData = {
        name: editFormData.name.trim(),
        client: editFormData.client.trim(),
        domain: editFormData.domain.trim(),
        subdomain: editFormData.subdomain.trim(),
        theme: editFormData.theme,
      };

      await api.updateWebsite(editingWebsite.id, updateData);
      showNotification('success', `Website "${editFormData.name}" updated successfully`);
      
      // Refresh websites
      await fetchWebsites();
      setShowEditModal(false);
      setEditingWebsite(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update website';
      showNotification('error', errorMsg);
      console.error('Update website error:', err);
    }
  };

  // ============================================
  // 12. DELETE WEBSITE
  // ============================================
  const handleDeleteWebsite = async (website: WebsiteProject) => {
    if (!window.confirm(`Are you sure you want to delete "${website.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteWebsite(website.id);
      showNotification('success', `Website "${website.name}" deleted successfully`);
      
      // Refresh websites
      await fetchWebsites();

      // Clear selection if the deleted website was selected
      if (selectedWebsite?.id === website.id) {
        setSelectedWebsite(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete website';
      showNotification('error', errorMsg);
      console.error('Delete website error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================
  // 11. STEP RENDERERS
  // ============================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Tell us about your website project</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
              <Input
                label="Website Name *"
                placeholder="e.g., SS4U Client Website"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  saveDraft();
                }}
              />

              <Input
                label="Client Name"
                placeholder="e.g., Société X"
                value={formData.client}
                onChange={(e) => {
                  setFormData({ ...formData, client: e.target.value });
                  saveDraft();
                }}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Brief description of the website purpose..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    saveDraft();
                  }}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 'domain':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Domain Configuration</h3>
              <p className="text-gray-600">Set up your website's domain</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., client.ss4u.ma"
                    value={formData.domain}
                    onChange={(e) => {
                      const domain = e.target.value;
                      const subdomain = extractSubdomain(domain);
                      setFormData({ ...formData, domain, subdomain });
                      checkDomainAvailability(domain);
                      saveDraft();
                    }}
                  />
                  {domainStatus === 'checking' && (
                    <div className="flex items-center gap-2 px-4 min-w-max">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600">Checking...</span>
                    </div>
                  )}
                  {domainStatus === 'available' && (
                    <div className="flex items-center gap-2 px-4 min-w-max text-green-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Available</span>
                    </div>
                  )}
                  {domainStatus === 'taken' && (
                    <div className="flex items-center gap-2 px-4 min-w-max text-red-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Already in use</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain (Auto-filled)
                </label>
                <Input
                  placeholder="e.g., client"
                  value={formData.subdomain}
                  disabled
                  className="bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-2">
                  The subdomain is automatically extracted from your domain. It's the part before the first dot.
                </p>
              </div>
            </div>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Language & Localization</h3>
              <p className="text-gray-600">Configure language support for your website</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
              <div>
                <Select
                  label="Default Language *"
                  value={formData.defaultLanguage}
                  onChange={(e) => {
                    const lang = e.target.value as 'en' | 'fr' | 'ar';
                    setFormData({
                      ...formData,
                      defaultLanguage: lang,
                      languages: formData.languages.includes(lang)
                        ? formData.languages
                        : [...formData.languages, lang]
                    });
                    saveDraft();
                  }}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'fr', label: 'Français' },
                    { value: 'ar', label: 'العربية' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Supported Languages *
                </label>
                <div className="space-y-3">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'fr', name: 'Français' },
                    { code: 'ar', name: 'العربية' },
                  ].map(({ code, name }) => (
                    <label key={code} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(code as 'en' | 'fr' | 'ar')}
                        onChange={() => handleLanguageToggle(code as 'en' | 'fr' | 'ar')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900">{name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3 p-3 bg-gray-50 rounded">
                  ℹ️ The default language is automatically included in supported languages
                </p>
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Theme Selection</h3>
              <p className="text-gray-600">Choose how your website will look</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'minimal',
                    name: 'Minimal',
                    description: 'Clean and simple design',
                  },
                  {
                    id: 'business',
                    name: 'Business',
                    description: 'Professional corporate look',
                  },
                  {
                    id: 'blog',
                    name: 'Blog',
                    description: 'Content-focused layout',
                  },
                ].map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setFormData({ ...formData, theme: theme.id as 'minimal' | 'business' | 'blog' });
                      saveDraft();
                    }}
                    className={`relative cursor-pointer border-2 rounded-lg p-6 transition-all text-center ${
                      formData.theme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      {theme.id === 'minimal' && (
                        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                      {theme.id === 'business' && (
                        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4 0h1m-1 4h1m4 0h1m-1 4h1" />
                        </svg>
                      )}
                      {theme.id === 'blog' && (
                        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{theme.name}</h4>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                    {formData.theme === theme.id && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Create</h3>
              <p className="text-gray-600">Please review your website configuration before creating</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-semibold text-gray-900">Website Details</h4>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Website Name</span>
                  <p className="text-gray-900 font-medium">{formData.name}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Client</span>
                  <p className="text-gray-900">{formData.client || '—'}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Domain</span>
                  <p className="text-gray-900 font-mono">{formData.domain}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Subdomain</span>
                  <p className="text-gray-900 font-mono">{formData.subdomain}</p>
                </div>
                {formData.description && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
                    <p className="text-gray-600 text-sm">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-semibold text-gray-900">Configuration</h4>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Default Language</span>
                  <p className="text-gray-900 font-medium">
                    {formData.defaultLanguage === 'en' ? 'English' :
                     formData.defaultLanguage === 'fr' ? 'Français' : 'العربية'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Languages</span>
                  <div className="flex gap-2 mt-1">
                    {formData.languages.map(lang => (
                      <span key={lang} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Theme</span>
                  <p className="text-gray-900 font-medium capitalize">
                    {formData.theme === 'minimal' && 'Minimal'}
                    {formData.theme === 'business' && 'Business'}
                    {formData.theme === 'blog' && 'Blog'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Website will be created in draft status</li>
                <li>✓ Default pages (Home, About, Contact) will be generated</li>
                <li>✓ Main navigation menu will be set up</li>
                <li>✓ You'll be redirected to the dashboard to start adding content</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
    

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Website Selector */}
        <div className="mb-8">
          <WebsiteSelector
            websites={websites}
            selectedWebsite={selectedWebsite}
            onSelect={handleSelectWebsite}
            onCreate={() => setShowWizard(true)}
            onEdit={handleEditWebsite}
            onDelete={handleDeleteWebsite}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading websites</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Modal */}
      <Modal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        title="Create New Website"
        size="lg"
      >
        <div className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < getCurrentStepIndex()
                      ? 'bg-green-500 text-white'
                      : index === getCurrentStepIndex()
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < getCurrentStepIndex() ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    index === getCurrentStepIndex() ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${
                    index < getCurrentStepIndex() ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              onClick={() => setShowWizard(false)}
              variant="secondary"
              className="px-4 py-2"
            >
              Cancel
            </Button>

            <div className="flex space-x-3">
              {getCurrentStepIndex() > 0 && (
                <Button
                  onClick={goToPreviousStep}
                  variant="secondary"
                  className="px-4 py-2"
                >
                  Previous
                </Button>
              )}

              {currentStep !== 'review' ? (
                <Button
                  onClick={goToNextStep}
                  disabled={!!validateCurrentStep()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateWebsite}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* EDIT WEBSITE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingWebsite(null);
        }}
        title="Edit Website"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Website Name *"
            placeholder="Enter website name"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
          />
          <Input
            label="Client Name"
            placeholder="Enter client name"
            value={editFormData.client}
            onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
          />
          <Input
            label="Domain"
            placeholder="e.g., example.com"
            value={editFormData.domain}
            onChange={(e) => {
              const domain = e.target.value;
              const subdomain = extractSubdomain(domain);
              setEditFormData({ ...editFormData, domain, subdomain });
            }}
          />
          <Input
            label="Subdomain (Auto-filled)"
            placeholder="e.g., example"
            value={editFormData.subdomain}
            disabled
            className="bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <Select
            label="Theme"
            value={editFormData.theme}
            onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value as 'minimal' | 'business' | 'blog' })}
            options={[
              { value: 'minimal', label: 'Minimal' },
              { value: 'business', label: 'Business' },
              { value: 'blog', label: 'Blog' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditModal(false);
                setEditingWebsite(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWebsite}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { API_BASE_URL, materialApi } from '../../services/api';

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    materialApi
      .list()
      .then(({ data }) => setMaterials(data.results || data))
      .catch(() => setMessage('No live materials loaded yet.'));
  }, []);

  const materialUrl = (material) => {
    if (material.link) return material.link;
    if (material.file?.startsWith('http')) return material.file;
    if (material.file) return `${API_BASE_URL}${material.file}`;
    return '#';
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Materials</h1>
        <p className="text-gray-600">Download and view materials from your enrolled courses.</p>
      </div>

      {message && <p className="mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded p-3">{message}</p>}

      {materials.length > 0 ? (
        <div className="space-y-4">
          {materials.map((material) => (
            <Card key={material.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{material.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Uploaded {material.uploaded_at ? new Date(material.uploaded_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={materialUrl(material)} target="_blank" rel="noreferrer">
                    <Button variant="primary" size="sm">Open</Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card><p className="text-center text-gray-600 py-12">No materials available yet</p></Card>
      )}
    </MainLayout>
  );
};

export default MaterialsPage;

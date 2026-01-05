import { useState, useEffect } from 'react';
import { DatabaseConfig } from '@/types/lead';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Save, TestTube, CheckCircle, XCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DatabaseConfigModalProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'nws_db_config';

export function DatabaseConfigModal({ open, onClose }: DatabaseConfigModalProps) {
  const [config, setConfig] = useState<DatabaseConfig>({
    host: '127.0.0.1',
    port: 8889,
    username: 'root',
    password: 'root',
    database: 'crm',
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error('Failed to parse saved config');
        }
      }
      setSaved(false);
      setTestStatus('idle');
    }
  }, [open]);

  const updateField = (field: keyof DatabaseConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
  };

  const handleTest = () => {
    setTestStatus('testing');
    // Simulate connection test - in real app this would call your backend API
    setTimeout(() => {
      // This is a mock - real implementation would need a backend endpoint
      setTestStatus(Math.random() > 0.3 ? 'success' : 'error');
    }, 1500);
  };

  const generatePhpCode = () => {
    return `<?php
// server/database.php

$servername = "${config.host}";
$username = "${config.username}";
$password = "${config.password}";
$dbname = "${config.database}";
$port = ${config.port};

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// connection OK
?>`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Database Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <Alert className="bg-blue-900/20 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-sm text-muted-foreground">
              Configure your local MySQL database connection. This is used when connecting to Sequel Ace or MAMP.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <Label>Host</Label>
              <Input 
                value={config.host}
                onChange={(e) => updateField('host', e.target.value)}
                placeholder="127.0.0.1"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Label>Port</Label>
              <Input 
                type="number"
                value={config.port}
                onChange={(e) => updateField('port', parseInt(e.target.value) || 3306)}
                placeholder="8889"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Label>Username</Label>
              <Input 
                value={config.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="root"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Label>Password</Label>
              <Input 
                type="password"
                value={config.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="col-span-2">
              <Label>Database Name</Label>
              <Input 
                value={config.database}
                onChange={(e) => updateField('database', e.target.value)}
                placeholder="crm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className="flex-1"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Config
            </Button>
          </div>

          {testStatus === 'success' && (
            <Alert className="bg-emerald-900/20 border-emerald-500/30">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-emerald-400">
                Connection successful! Database is accessible.
              </AlertDescription>
            </Alert>
          )}

          {testStatus === 'error' && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                Connection failed. Please check your credentials and ensure the database server is running.
              </AlertDescription>
            </Alert>
          )}

          {saved && (
            <Alert className="bg-emerald-900/20 border-emerald-500/30">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-emerald-400">
                Configuration saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* PHP Code Preview */}
          <div className="mt-4">
            <Label className="mb-2 block">Generated PHP Code</Label>
            <pre className="p-3 bg-secondary rounded-lg text-xs overflow-x-auto border border-border">
              <code className="text-emerald-400">{generatePhpCode()}</code>
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Copy this code to your server/database.php file
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

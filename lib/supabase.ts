import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypjwbbbmhygxtpnrtyny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwandiYmJtaHlneHRwbnJ0eW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MDk3MDYsImV4cCI6MjA4Mjk4NTcwNn0.VXqHAfFRIF8AgRLplGTQjIFumRU0uLZ4L6aRgFXqneA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

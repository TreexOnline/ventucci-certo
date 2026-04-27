// Script simples para testar conexão com Supabase e verificar produtos
import { createClient } from '@supabase/supabase-js';

// Configurações do ambiente
const SUPABASE_URL = "https://dxkqeaqgwvlghuuexcrf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4a3FlYXFnd3ZsZ2h1dWV4Y3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NjkzNjIsImV4cCI6MjA5MjE0NTM2Mn0.qVo0z7StXWdfDZEe0PYDhsf15PLCgiCELJBjqcZv8l4";

console.log('Testando conexão com Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_PUBLISHABLE_KEY ? 'Presente' : 'Ausente');

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    // Testar conexão básica
    console.log('\n🔍 Testando conexão básica...');
    
    // Verificar quantidade de produtos
    console.log('\n🔍 Verificando quantidade de produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      
      // Verificar se é erro de permissão ou tabela não existe
      if (productsError.code === 'PGRST116') {
        console.error('❌ Tabela "products" não existe ou não tem permissão de acesso!');
      } else if (productsError.code === 'PGRST301') {
        console.error('❌ Sem permissão para acessar a tabela "products"!');
      }
      return;
    }
    
    console.log(`📊 Total de produtos: ${products.length}`);
    
    if (products.length === 0) {
      console.log('⚠️  Nenhum produto encontrado no banco de dados!');
      console.log('🔍 Isso pode ser porque:');
      console.log('   1. A tabela está vazia');
      console.log('   2. As migrações não foram executadas');
      console.log('   3. Não há dados de exemplo inseridos');
    } else {
      console.log('✅ Produtos encontrados:');
      products.slice(0, 5).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - ${product.category} - R$${product.price}`);
      });
      
      if (products.length > 5) {
        console.log(`  ... e mais ${products.length - 5} produtos`);
      }
    }
    
    // Verificar produtos ativos
    console.log('\n🔍 Verificando produtos ativos...');
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);
    
    if (activeError) {
      console.error('❌ Erro ao buscar produtos ativos:', activeError);
    } else {
      console.log(`📊 Produtos ativos: ${activeProducts.length}`);
      
      if (activeProducts.length === 0 && products.length > 0) {
        console.log('⚠️  Todos os produtos estão inativos (is_active = false)');
      }
    }
    
    // Verificar estrutura da tabela
    console.log('\n🔍 Verificando estrutura da tabela...');
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log('📋 Colunas encontradas:', Object.keys(sampleProduct));
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testConnection();

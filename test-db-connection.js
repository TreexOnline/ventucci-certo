// Script para testar conexão com Supabase e verificar produtos
const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Testando conexão com Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_PUBLISHABLE_KEY ? 'Presente' : 'Ausente');

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  try {
    // Testar conexão básica
    console.log('\n🔍 Testando conexão básica...');
    const { data, error } = await supabase.from('products').select('count').single();
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return;
    }
    
    console.log('✅ Conexão bem-sucedida!');
    
    // Verificar quantidade de produtos
    console.log('\n🔍 Verificando quantidade de produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Erro ao buscar produtos:', productsError);
      return;
    }
    
    console.log(`📊 Total de produtos: ${products.length}`);
    
    if (products.length === 0) {
      console.log('⚠️  Nenhum produto encontrado no banco de dados!');
      
      // Verificar se tabela existe
      console.log('\n🔍 Verificando estrutura da tabela...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (tableError && tableError.code === 'PGRST116') {
        console.error('❌ Tabela "products" não existe!');
      } else if (tableError) {
        console.error('❌ Erro ao verificar tabela:', tableError);
      } else {
        console.log('✅ Tabela "products" existe, mas está vazia');
      }
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
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testConnection();

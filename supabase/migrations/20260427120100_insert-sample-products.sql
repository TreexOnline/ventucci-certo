-- Inserir dados de exemplo de produtos para o Ventucci
-- Estes são produtos típicos de um distribuidor de bebidas e mercearia

INSERT INTO public.products (name, category, details, price, price_retail, image_url, sort_order, is_active, is_featured, product_group) VALUES
-- Bebidas Alcoólicas
('Cerveja Brahma 600ml', 'Cervejas', 'Cerveja Brahma Chopp garrafa 600ml', 4.50, 5.99, '/src/assets/brahma.webp', 1, true, true, 'Bebidas'),
('Cerveja Skol 600ml', 'Cervejas', 'Cerveja Skol garrafa 600ml', 4.30, 5.79, '/src/assets/skol.webp', 2, true, true, 'Bebidas'),
('Cerveja Heineken 330ml', 'Cervejas', 'Cerveja Heineken garrafa 330ml importada', 6.80, 8.99, '/src/assets/heineken.webp', 3, true, true, 'Bebidas'),
('Coca-Cola 2L', 'Refrigerantes', 'Refrigerante Coca-Cola garrafa 2 litros', 7.20, 9.50, '/src/assets/coca.webp', 4, true, true, 'Bebidas'),
('Água Mineral 500ml', 'Águas', 'Água mineral sem gás 500ml', 1.20, 2.50, '/src/assets/agua.webp', 5, true, false, 'Bebidas'),
('Red Bull 250ml', 'Energéticos', 'Energy drink Red Bull lata 250ml', 8.90, 12.99, '/src/assets/redbull.webp', 6, true, true, 'Bebidas'),
('Smirnoff 1L', 'Destilados', 'Vodka Smirnoff 1 litro', 45.00, 59.90, '/src/assets/smirnoff.webp', 7, true, false, 'Bebidas'),
('Jack Daniel\'s 750ml', 'Destilados', 'Whisky Jack Daniel\'s 750ml', 120.00, 159.90, '/src/assets/jack.webp', 8, true, false, 'Bebidas'),

-- Mercearia
('Arroz 5kg', 'Grãos', 'Arroz branco tipo 1 pacote 5kg', 18.50, 24.90, NULL, 9, true, false, 'Mercearia'),
('Feijão Carioca 1kg', 'Grãos', 'Feijão carioca 1kg', 6.80, 8.99, NULL, 10, true, false, 'Mercearia'),
('Óleo de Soja 900ml', 'Óleos', 'Óleo de soja Liza 900ml', 7.20, 9.90, NULL, 11, true, false, 'Mercearia'),
('Açúcar 1kg', 'Açúcares', 'Açúcar refinado União 1kg', 4.50, 6.20, NULL, 12, true, false, 'Mercearia'),
('Sal 1kg', 'Temperos', 'Sal de cozinha Cisne 1kg', 2.80, 4.20, NULL, 13, true, false, 'Mercearia'),
('Café 500g', 'Cafés', 'Café torrado e moído Pilão 500g', 15.90, 21.90, NULL, 14, true, false, 'Mercearia'),
('Macarrão 500g', 'Massas', 'Macarrão tipo espaguete 500g', 3.20, 4.90, NULL, 15, true, false, 'Mercearia'),

-- Limpeza
('Detergente 500ml', 'Limpeza', 'Detergente líquido Ypê 500ml', 2.50, 3.90, NULL, 16, true, false, 'Limpeza'),
('Sabão em Pó 1kg', 'Limpeza', 'Sabão em pó Omo 1kg', 12.90, 18.90, NULL, 17, true, false, 'Limpeza'),
('Água Sanitária 1L', 'Limpeza', 'Água sanitária Qboa 1 litro', 3.80, 5.90, NULL, 18, true, false, 'Limpeza'),
('Desinfetante 1L', 'Limpeza', 'Desinfetante Pinho Sol 1 litro', 8.20, 11.90, NULL, 19, true, false, 'Limpeza'),
('Limpavidro 500ml', 'Limpeza', 'Limpavidros Cif 500ml', 6.50, 9.20, NULL, 20, true, false, 'Limpeza'),

-- Mais Bebidas
('Guaraná 2L', 'Refrigerantes', 'Guaraná Antarctica garrafa 2 litros', 6.80, 8.90, NULL, 21, true, false, 'Bebidas'),
('Fanta Laranja 2L', 'Refrigerantes', 'Fanta laranja garrafa 2 litros', 6.50, 8.50, NULL, 22, true, false, 'Bebidas'),
('Sprite 2L', 'Refrigerantes', 'Sprite limão garrafa 2 litros', 6.30, 8.20, NULL, 23, true, false, 'Bebidas'),

-- Mercearia - Extras
('Farinha de Trigo 1kg', 'Grãos', 'Farinha de trigo Dona Benta 1kg', 5.20, 7.90, NULL, 24, true, false, 'Mercearia'),
('Leite Integral 1L', 'Laticínios', 'Leite integral longa vida 1 litro', 3.80, 5.20, NULL, 25, true, false, 'Mercearia'),
('Manteiga 500g', 'Laticínios', 'Manteiga sem sal 500g', 12.50, 16.90, NULL, 26, true, false, 'Mercearia'),
('Ovos 30 unidades', 'Ovos', 'Ovos brancos caixa 30 unidades', 15.00, 22.00, NULL, 27, true, false, 'Mercearia'),

-- Limpeza - Extras
('Papel Higiênico 4 rolos', 'Higiene', 'Papel higiênico Neve 4 rolos', 8.90, 13.90, NULL, 28, true, false, 'Limpeza'),
('Sabonete 90g', 'Higiene', 'Sabonete em barra Dove 90g', 3.20, 4.90, NULL, 29, true, false, 'Limpeza'),
('Pasta de Dente 90g', 'Higiene', 'Pasta de dente Colgate 90g', 5.80, 8.20, NULL, 30, true, false, 'Limpeza');

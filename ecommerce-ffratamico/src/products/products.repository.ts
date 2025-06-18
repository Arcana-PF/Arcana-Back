import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoryRepository } from 'src/categories/categories.repository';
import { MockProducts } from './mock/mock.products.data';
import { ProductRating } from './entities/productRating.entity';
import { UserRepository } from 'src/users/users.repository';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product) private repository: Repository<Product>,
    @InjectRepository(ProductRating)
    private readonly ratingRepository: Repository<ProductRating>,
    private readonly categoryRepository: CategoryRepository,
    private readonly userRepository: UserRepository
  ) {}

  private readonly mockProducts = MockProducts;

  async addProductsSeeder(): Promise<void> {
    for (const product of this.mockProducts) {
      try {
        const createProductDto: CreateProductDto = {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imgUrl: product.imgUrl,
          categoryNames: product.categoryNames,
        };

        await this.createProduct(createProductDto);
        console.log(`✅ Producto "${product.name}" creado con éxito.`);
      } catch (error) {
        if (error instanceof ConflictException) {
          console.warn(
            `⚠️ El producto "${product.name}" ya existe. Se omitió.`,
          );
        } else if (error instanceof NotFoundException) {
          console.warn(
            `⚠️ Categoría "${product.categoryNames}" no encontrada. Se omitió el producto "${product.name}".`,
          );
        } else {
          throw error;
        }
      }
    }
  }

  async getProducts() {
    return await this.repository.find();
  }

  async getProductsWithPagination(page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const products = await this.repository.find();
    return products.slice(startIndex, endIndex).map((product) => product);
  }

  async getProductById(id: string) {
    const product = await this.repository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('El id del producto no existe');
    return product;
  }

  async createProduct(createProductDto: CreateProductDto) {
    // Normalizamos todos los nombres de categorías que vienen del DTO
    const normalizedCategoryNames = createProductDto.categoryNames.map((name) =>
      this.normalize(name),
    );

    // Obtenemos todas las categorías de la base de datos
    const allCategoriesFromDatabase =
      await this.categoryRepository.getCategories();

    // Filtramos solo las categorías que coincidan por nombre normalizado
    const matchedCategories = allCategoriesFromDatabase.filter((dbCategory) =>
      normalizedCategoryNames.includes(this.normalize(dbCategory.name)),
    );

    // Validamos que todas las categorías del DTO existan
    if (matchedCategories.length !== normalizedCategoryNames.length) {
      throw new NotFoundException(
        `Una o más categorías no existen: ${createProductDto.categoryNames.join(', ')}`,
      );
    }

    // Validamos si ya existe un producto con el mismo nombre
    const existingProductWithSameName = await this.repository.findOne({
      where: { name: createProductDto.name },
    });

    if (existingProductWithSameName) {
      throw new ConflictException(
        `Ya existe un producto con el nombre "${createProductDto.name}"`,
      );
    }

    // Extraemos categoryNames para que no se pase al crear el producto
    const { categoryNames, ...productDataWithoutCategoryNames } =
      createProductDto;

    // Creamos el producto asociando múltiples categorías
    const newProductToSave = this.repository.create({
      ...productDataWithoutCategoryNames,
      categories: matchedCategories, // ← Asignación múltiple
    });

    await this.repository.save(newProductToSave);

    return newProductToSave;
  }

  async deleteProduct(id: string) {
    const exists = await this.repository.findOne({ where: { id } });

    if (!exists) {
      throw new NotFoundException('El producto que desea borrar no existe');
    }

    // 🔁 Verificamos si ya está desactivado
    if (!exists.isActive) {
      throw new ConflictException('El producto ya está desactivado');
    }

    // ✅ Borrado lógico: seteamos isActive en false
    exists.isActive = false;
    await this.repository.save(exists);

    return {
      message: 'Producto desactivado correctamente',
      productId: id,
      isActive: false,
      dateDeleted: new Date(), // opcional
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const exists = await this.repository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!exists)
      throw new NotFoundException('El producto que desea modificar no existe');

    // ✅ NUEVO BLOQUE: actualizar categorías si vienen en el DTO
    if (updateProductDto.categoryNames) {
      const allCategories = await this.categoryRepository.getCategories();

      const matchedCategories = allCategories.filter((cat) =>
        updateProductDto.categoryNames.some(
          (name) => this.normalize(cat.name) === this.normalize(name),
        ),
      );

      if (matchedCategories.length !== updateProductDto.categoryNames.length) {
        throw new NotFoundException('Una o más categorías no existen');
      }

      exists.categories = matchedCategories; // ✅ Se reasignan las categorías encontradas
    }
    // ✅ ACTUALIZAR OTROS CAMPOS DEL PRODUCTO
    const { categoryNames, ...rest } = updateProductDto; // Excluimos categoryNames

    Object.assign(exists, updateProductDto);
    await this.repository.save(exists);

    const updated = await this.repository.findOne({
      where: { id },
      relations: ['categories'],
    });

    return updated;
  }

  // src/products/products.repository.ts

  async rateProduct(
    userId: string,
    productId: string,
    score: number,
    ): Promise<Product> {
    const product = await this.repository.findOne({
      where: { id: productId },
      relations: ['ratings'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const user = await this.userRepository.getById(userId);

    let existingRating = await this.ratingRepository.findOne({
    where: {
      user: { id: userId },
      product: { id: productId },
    },
    relations: ['product', 'user'],
    });

    if (existingRating) {
      existingRating.score = score;
      await this.ratingRepository.save(existingRating);
    } else {
      const newRating = this.ratingRepository.create({ user, product, score });
      await this.ratingRepository.save(newRating);
      product.ratings.push(newRating);
    }

    // recalcular promedio
    const allRatings = await this.ratingRepository.find({
      where: { product: { id: productId } },
    });
    const avg =
      allRatings.reduce((acc, r) => acc + r.score, 0) / allRatings.length;

    product.rating = parseFloat(avg.toFixed(2));
    return await this.repository.save(product);
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
}

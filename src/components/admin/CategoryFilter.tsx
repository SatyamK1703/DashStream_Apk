import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { styles } from './AdminService.styles';
interface Category {
    id:string;
    name:string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id 
              ? styles.categoryButtonActive 
              : styles.categoryButtonInactive
          ]}
          onPress={() => onCategorySelect(category.id)}
        >
          <Text 
            style={
              selectedCategory === category.id 
                ? styles.categoryTextActive 
                : styles.categoryTextInactive
            }
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryFilter;

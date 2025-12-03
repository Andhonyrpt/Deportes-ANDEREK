import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import categoriesData from '../../data/categories.json';
import './Navigation.css';

export default function Navigation({ activeCategory, activeSubcategory, onSubcategoryClick, availableSubcategories }) {
    const [categories, setCategories] = useState([]);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isSubcategoriesMenuOpen, setIsSubcategoriesMenuOpen] = useState(false);

    useEffect(() => {

        const mainCategories = categoriesData.map((category) =>
            category.parentCategory)
            .filter((parent) => parent && parent._id);

        const parentCategories = mainCategories.filter((category, index, self) =>
            index === self.findIndex((c) =>
                c._id === category._id));

        setCategories(parentCategories);

    }, [activeCategory]);

    const isSubcategoryButtonDisabled = !availableSubcategories || availableSubcategories.length === 0;

    return (
        <div className='container'>
            <div className='navigation-content'>
                <div className='categories-dropdown'>
                    <button
                        className='dropdown-btn'
                        onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}>
                        {activeCategory ? activeCategory?.name : 'Ligas del mundo'}
                        <Icon name="chevronDown" size={14} />
                    </button>

                    {isCategoryMenuOpen && categories.length > 0 && (
                        <div className='categories-dropdown-menu'>
                            {categories.map((category) => {

                                return (
                                    <div key={category._id}
                                        className='category-group'
                                    >
                                        <Link
                                            to={`/category/${category._id}`}
                                        >
                                            {category.name}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className='subcategories-dropdown '>
                    <button
                        onClick={() => setIsSubcategoriesMenuOpen(!isSubcategoriesMenuOpen)}
                        className='dropdown-btn'
                        disabled={isSubcategoryButtonDisabled}
                    >
                        {activeSubcategory ? activeSubcategory?.name : "Equipos"}
                        <Icon name="chevronDown" size={14} />
                    </button>

                    {isSubcategoriesMenuOpen && availableSubcategories && availableSubcategories.length > 0 && (
                        <div className='categories-dropdown-menu subcategories-dropdown-menu'>
                            {availableSubcategories.map((subcat) => (
                                <a key={subcat._id}
                                    href='#'
                                    onClick={(e) => {
                                        e.preventDefault();

                                        if (onSubcategoryClick) {
                                            onSubcategoryClick(subcat._id);
                                        }

                                        setIsSubcategoriesMenuOpen(false)

                                    }}
                                >
                                    {subcat.name}
                                </a>
                            ))}
                        </div>
                    )}
                    {activeCategory && availableSubcategories && availableSubcategories.length === 0 && (
                        <p>No hay equipos disponibles para esta liga</p>
                    )}
                </div>
            </div>
        </div>
    );
};
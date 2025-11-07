import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import categoriesData from '../../data/categories.json';
import './Navigation.css';

export default function Navigation({ onLinkClick, activeCategory, onSubcategoryClick }) {
    const [categories, setCategories] = useState([]);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [activeParentCategory, setActiveParentCategory] = useState(null);
    const [activeSubcategories, setActiveSubcategories] = useState([]);
    const [isSubcategoriesMenuOpen, setIsSubcategoriesMenuOpen] = useState(false);

    useEffect(() => {

        const mainCategories = categoriesData.map((category) =>
            category.parentcategory)
            .filter((parent) => parent && parent._id);

        const parentCategories = mainCategories.filter((category, index, self) =>
            index === self.findIndex((c) =>
                c._id === category._id))

        setCategories(parentCategories);

        if (activeCategory && activeCategory._id) {
            setActiveParentCategory(activeCategory);

            const subs = getSubcategories(activeCategory._id);
            setActiveSubcategories(subs);

            setIsCategoryMenuOpen(false);
        } else {
            setIsSubcategoriesMenuOpen(false);
        }

    }, [activeCategory]);

    const getSubcategories = (parentId) => {
        return (
            categoriesData.filter((cat) => cat.parentcategory &&
                cat.parentcategory._id === parentId
            )
        );
    };

    const handleParentCategory = (category) => {
        setActiveParentCategory(category);


        const subs = getSubcategories(category._id);
        setActiveSubcategories(subs);

        setIsCategoryMenuOpen(false);
    }

    return (
        <div className='navigation'>
            <div className='container'>
                <div className='navigation-content'>
                    <div className='categories-dropdown'>
                        <button
                            className='categories-menu-btn'
                            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}>
                            <span>{activeCategory ? activeCategory.name : 'Todas las categorías'}</span>
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
                                                onClick={() => handleParentCategory(category)}
                                            >
                                                {category.name}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className='subcategories-dropdown'>
                        <button
                            onClick={() => setIsSubcategoriesMenuOpen(!isSubcategoriesMenuOpen)}
                            className='subcategories-clear-btn'
                        >
                            Subcategorías
                            <Icon name="chevronDown" size={14} />
                        </button>

                        {isSubcategoriesMenuOpen && activeSubcategories.length > 0 && (
                            <div className='subcategories-menu'>
                                {activeSubcategories.map((subcat) => (
                                    <a key={subcat._id}
                                    href='#'
                                        onClick={(e) => {
                                            e.preventDefault();

                                            if (onSubcategoryClick) {
                                                onSubcategoryClick(subcat._id);
                                            }

                                            setIsSubcategoriesMenuOpen(false)

                                            // if(onLinkClick)onLinkClick();

                                        }}
                                    >
                                        {subcat.name}
                                    </a>
                                ))}
                            </div>
                        )}
                        {activeParentCategory && activeSubcategories.length === 0 && (
                            <p>No hay equipos disponibles para esta liga</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
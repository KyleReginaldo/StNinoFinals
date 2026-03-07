import { LucideIcon } from 'lucide-react';

export type ItemProps = {
  label: string;
  isSelected: boolean;
  link: string;
  icon: LucideIcon;
};

const Item = ({ label, isSelected, link, icon: Icon }: ItemProps) => {
  return (
    <a href={link}>
      <li
        className={`${isSelected ? 'text-white font-bold' : 'text-gray-400'} flex items-center gap-4 cursor-pointer hover:text-white transition-colors`}
      >
        <Icon
          size={isSelected ? 20 : 18}
          className={isSelected ? 'text-white' : 'text-gray-500'}
        />
        {label}
      </li>
    </a>
  );
};

export default Item;

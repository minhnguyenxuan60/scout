import './FilterLoading.scss';
import '../Loading.scss';

export default function FilterLoading() {
  return (
    <div className="">
      <div className="filter-loading-wrapper">
        {[...Array(10)].map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className="multi-buttons">
            <input type="checkbox" disabled className="checkbox" />
            <span className="animate item-name" />
            <span className="animate pill" />
          </li>
        ))}
      </div>
    </div>
  );
}

import MonthlySales from './MonthlySales';
import HighDemandProducts from './HighDemandProducts';
import LowDemandItems from './LowDemandProducts';
import CategorySales from './CategorySales';

const SalesManagement = () => {

    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
                {/* Make MonthlySales span 2 columns on medium and larger screens */}
                <div className="md:col-span-2 h-full">
                    <div className="h-full flex flex-col">
                        <MonthlySales />
                    </div>
                </div>
                <div className="md:col-span-1 h-full">

                    <div className="h-full flex flex-col">
                        <CategorySales />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">

                <div className="md:col-span-1 h-full">

                    <div className="h-full flex flex-col">
                        <HighDemandProducts />
                    </div>
                </div>
                <div className="md:col-span-1 h-full">

                    <div className="h-full flex flex-col">
                        <LowDemandItems />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalesManagement;

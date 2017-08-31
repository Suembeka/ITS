package hibernate;

/**
 *
 * @author ksinn
 */
public class Factory {

    
    private static Factory instance = null;
    private static EntityDAO entityDAO = null;
    private static TransactionDAO transactionDAO = null;

    public static synchronized Factory getInstance() {
        if (instance == null) {
            instance = new Factory();
        }
        return instance;
    }
    
    public EntityDAO getEntityDAO() {
        if (entityDAO == null) {
            entityDAO = new EntityDAOImpl();
        }
        return entityDAO;
    }
    
    public TransactionDAO getTransactionDAO() {
        if (transactionDAO == null) {
            transactionDAO = new TransactionDAOImpl();
        }
        return transactionDAO;
    }

}

package hibernate;

/**
 *
 * @author ksinn
 */
public class Factory {

    
    private static Factory instance = null;
    private static EntityDAO entityDAO = null;

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

}

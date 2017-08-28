package hibernate;

/**
 *
 * @author ksinn
 */

import org.apache.log4j.Logger;
import org.hibernate.cfg.Configuration;
import org.hibernate.SessionFactory;

public class HibernateUtil {
    private static final Logger log = Logger.getLogger(HibernateUtil.class.getName());

    private static final SessionFactory sessionFactory;

    static {
        try {
            sessionFactory = new Configuration().configure().buildSessionFactory();
        } catch (Throwable ex) {
            log.error(null, ex);
            throw new ExceptionInInitializerError(ex);
        }
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }
}

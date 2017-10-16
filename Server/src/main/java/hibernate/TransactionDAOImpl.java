package hibernate;

/**
 *
 * @author ksinn
 */
import entity.Transaction;
import entity.TransactionId;
import java.sql.SQLException;
import java.util.Collection;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Session;

public class TransactionDAOImpl implements TransactionDAO {
    private static final Logger log = Logger.getLogger(TransactionDAOImpl.class.getName());

    @Override
    public void add(Transaction entity) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            session.save(entity);
            session.getTransaction().commit();
        } catch (Exception ex) {
            log.error("Can not add Transaction object :(", ex);
            throw ex;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }
    
    @Override
    public void addAll(Collection<Transaction> list) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            
            Iterator it = list.iterator();
            while(it.hasNext()){
                session.save(it.next());
            }
            
            session.getTransaction().commit();
        } catch (Exception ex) {
            log.error("Can not add Transaction object :(", ex);
            throw ex;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }

    @Override
    public void update(TransactionId id, Transaction entity) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            session.update(entity);
            session.getTransaction().commit();
        } catch (Exception e) {
            log.error("Can not update Transaction object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }

    @Override
    public Transaction getById(TransactionId id) throws SQLException {
        Session session = null;
        Transaction entity = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            entity =  session.get(Transaction.class, id);
        } catch (Exception e) {
            log.error("Can not get by ID Transaction object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
        return entity;
    }

    @Override
    public Collection<Transaction> getAll() throws SQLException {
        Session session = null;
        List entitys = new ArrayList();
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            entitys = session.createCriteria(Transaction.class).list();
        } catch (Exception e) {
            log.error("Can not get all Transaction objects :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
        return entitys;
    }

    @Override
    public void delete(Transaction entity) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            session.delete(entity);
            session.getTransaction().commit();
        } catch (Exception e) {
            log.error("Can not delete Transaction object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }

    @Override
    public Transaction getLastForTransportId(int transport_id) throws SQLException {
        
        Collection<Transaction> list = getAll();
        Iterator<Transaction> it = list.iterator();
        Transaction last = null;
        while(it.hasNext()){
            Transaction curent = it.next();
            if(curent.getId().getTransportId()==transport_id){
                if(last!=null){
                    if(curent.getId().getId()>last.getId().getId())
                        last = curent;
                } else {
                    last = curent;
                }
            }
        }
        
        return last;
            
        
        
        /*Session session = null;
        Transaction entity = null;
        try {
            
            session = HibernateUtil.getSessionFactory().openSession();
            Query query = session.createQuery("FROM Transaction WHERE Transaction.id.id=(SELECT max(Transaction.id.id) FROM Transaction WHERE Transaction.id.transportId=:trans_id)");
            query.setParameter("trans_id", transport_id);
            List list = query.list();
            if(list.size()!=0)
                entity = (Transaction) list.get(0);
            else 
                entity = null;
        } catch (Exception e) {
            log.error("Can not get by ID Transaction object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
        return entity;*/
    }

}
